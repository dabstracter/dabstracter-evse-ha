"""Small async client for the DABSTRACTER EVSE local HTTP API.

Authentication (firmware 15_web_auth.ino):
* X-Display-Token header -> "user" role, but only for GET /api/status, /api/mini,
  /api/energy, /api/trend, /api/stats, /api/events and POST /api/cmd.
* Password -> POST /api/login gives a ``devse_sid`` session cookie ("remember", 30 days).
  Basic Auth is not usable for POSTs: the firmware requires the X-Requested-With CSRF
  header on every POST and refuses Basic Auth when that header is present.
* No admin password set on the charger -> the API is open.
Every POST carries ``X-Requested-With: DABSTRACTER``.
"""

from __future__ import annotations

import asyncio
from http.cookies import CookieError, SimpleCookie
import json
import logging
from typing import Any

import aiohttp

from .const import REQUEST_TIMEOUT

_LOGGER = logging.getLogger(__name__)

CSRF_HEADER = {"X-Requested-With": "DABSTRACTER"}
COOKIE_NAME = "devse_sid"


class DabstracterError(Exception):
    """Base error."""


class DabstracterConnectionError(DabstracterError):
    """Charger not reachable or answered garbage."""


class DabstracterAuthError(DabstracterError):
    """401: missing or wrong credentials."""


class DabstracterForbiddenError(DabstracterError):
    """403: the credential is valid but not enough for this endpoint."""


class DabstracterCommandError(DabstracterError):
    """400: the charger rejected the request (message from the firmware)."""


def normalize_host(host: str) -> str:
    """Strip scheme and trailing slash."""
    host = host.strip().rstrip("/")
    if "://" in host:
        host = host.split("://", 1)[1]
    return host


class DabstracterApi:
    """Client for one charger."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        host: str,
        *,
        token: str | None = None,
        username: str | None = None,
        password: str | None = None,
    ) -> None:
        """Init. ``host`` may be a hostname, IP or host:port."""
        self.host = normalize_host(host)
        self._session = session
        self._token = token or None
        self._username = username or "user"
        self._password = password or None
        self._sid: str | None = None
        self._login_lock = asyncio.Lock()

    @property
    def base_url(self) -> str:
        """Base URL of the charger."""
        return f"http://{self.host}"

    @property
    def has_password(self) -> bool:
        """True when a password is configured (needed for /api/limit and /api/plan)."""
        return bool(self._password)

    @property
    def has_token(self) -> bool:
        """True when a display token is configured."""
        return bool(self._token)

    # ------------------------------------------------------------------ low level
    async def _raw(
        self,
        method: str,
        path: str,
        *,
        payload: dict[str, Any] | None = None,
        use_session: bool,
    ) -> tuple[int, str, list[str]]:
        """One HTTP round trip. Returns (status, body, Set-Cookie headers)."""
        headers: dict[str, str] = {"Accept": "application/json"}
        if method == "POST":
            headers.update(CSRF_HEADER)
        if use_session and self._sid:
            headers["Cookie"] = f"{COOKIE_NAME}={self._sid}"
        elif self._token:
            headers["X-Display-Token"] = self._token
        try:
            async with asyncio.timeout(REQUEST_TIMEOUT):
                async with self._session.request(
                    method,
                    f"{self.base_url}{path}",
                    json=payload,
                    headers=headers,
                    allow_redirects=False,
                ) as resp:
                    text = await resp.text()
                    cookies = list(resp.headers.getall("Set-Cookie", []))
                    return resp.status, text, cookies
        except (TimeoutError, aiohttp.ClientError) as err:
            raise DabstracterConnectionError(f"{method} {path}: {err}") from err

    async def login(self) -> None:
        """Get a session cookie with the password (POST /api/login)."""
        if not self._password:
            raise DabstracterAuthError("no password configured")
        status, text, cookies = await self._raw(
            "POST",
            "/api/login",
            payload={"user": self._username, "pass": self._password, "remember": True},
            use_session=False,
        )
        if status == 401:
            raise DabstracterAuthError("wrong username or password")
        if status == 429:
            raise DabstracterAuthError(f"login locked: {text}")
        if status != 200:
            raise DabstracterConnectionError(f"login: HTTP {status}")
        sid = None
        for raw in cookies:
            jar: SimpleCookie = SimpleCookie()
            try:
                jar.load(raw)
            except CookieError:
                continue
            if COOKIE_NAME in jar:
                sid = jar[COOKIE_NAME].value
        if not sid:
            raise DabstracterConnectionError("login: no session cookie in the answer")
        self._sid = sid

    async def request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        *,
        need_password: bool = False,
    ) -> Any:
        """Do a request, log in / re-login when needed, decode JSON."""
        use_session = self.has_password and (need_password or not self._token)
        if use_session and not self._sid:
            async with self._login_lock:
                if not self._sid:
                    await self.login()
        status, text, _ = await self._raw(method, path, payload=payload, use_session=use_session)
        if status == 401 and use_session:
            # session dropped (password change, 8 slots LRU, ...): log in once more
            async with self._login_lock:
                self._sid = None
                await self.login()
            status, text, _ = await self._raw(method, path, payload=payload, use_session=True)
        if status == 401:
            raise DabstracterAuthError(f"{path}: authentication required")
        if status == 403:
            raise DabstracterForbiddenError(f"{path}: {text}")
        if status == 400:
            raise DabstracterCommandError(text)
        if status != 200:
            raise DabstracterConnectionError(f"{path}: HTTP {status}")
        try:
            return json.loads(text)
        except ValueError as err:
            raise DabstracterConnectionError(f"{path}: invalid JSON") from err

    # ------------------------------------------------------------------ reads
    async def get_status(self) -> dict[str, Any]:
        """Full status (~6 kB)."""
        return await self.request("GET", "/api/status")

    async def get_mini(self) -> dict[str, Any]:
        """Compact live state (~0.5 kB, firmware 2.8.76+)."""
        return await self.request("GET", "/api/mini")

    async def get_energy(self) -> dict[str, Any]:
        """Energy summary, days, months, sessions."""
        return await self.request("GET", "/api/energy")

    # ------------------------------------------------------------------ commands
    async def command(self, cmd: str, **params: Any) -> bool:
        """POST /api/cmd: start, stop, cpwake, mode (0..3), maxA."""
        res = await self.request("POST", "/api/cmd", {"cmd": cmd, **params})
        return bool(res.get("ok", False)) if isinstance(res, dict) else False

    async def set_limit(self, payload: dict[str, Any]) -> dict[str, Any]:
        """POST /api/limit (needs a password: the display token is not enough)."""
        return await self.request("POST", "/api/limit", payload, need_password=True)

    async def set_plan(self, payload: dict[str, Any]) -> dict[str, Any]:
        """POST /api/plan (needs a password)."""
        return await self.request("POST", "/api/plan", payload, need_password=True)


async def probe(session: aiohttp.ClientSession, host: str) -> bool:
    """True when ``host`` looks like a DABSTRACTER charger (used by zeroconf).

    Unauthenticated /api/status answers 401 ``{"login":true}``; an open charger answers
    the full status with ``health.firmware`` and ``dlm``.
    """
    api = DabstracterApi(session, host)
    try:
        status, text, _ = await api._raw("GET", "/api/status", use_session=False)  # noqa: SLF001
        data = json.loads(text)
    except (DabstracterConnectionError, ValueError):
        return False
    if not isinstance(data, dict):
        return False
    if status == 401:
        return data.get("login") is True
    return status == 200 and "firmware" in (data.get("health") or {}) and "dlm" in data
