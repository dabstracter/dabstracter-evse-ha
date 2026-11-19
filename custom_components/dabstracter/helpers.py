"""Shared command helpers."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from .api import DabstracterCommandError, DabstracterError, DabstracterForbiddenError
from .const import DOMAIN
from .coordinator import DabstracterCoordinator


def _translate(err: DabstracterError) -> HomeAssistantError:
    if isinstance(err, DabstracterForbiddenError):
        return HomeAssistantError(
            translation_domain=DOMAIN, translation_key="forbidden", translation_placeholders={"msg": str(err)}
        )
    if isinstance(err, DabstracterCommandError):
        return HomeAssistantError(
            translation_domain=DOMAIN, translation_key="rejected", translation_placeholders={"msg": str(err)}
        )
    return HomeAssistantError(
        translation_domain=DOMAIN, translation_key="comm_error", translation_placeholders={"msg": str(err)}
    )


async def run_command(coordinator: DabstracterCoordinator, cmd: str, **params: Any) -> None:
    """POST /api/cmd, translate errors, refresh soon."""
    try:
        ok = await coordinator.api.command(cmd, **params)
    except DabstracterError as err:
        raise _translate(err) from err
    if not ok:
        raise HomeAssistantError(translation_domain=DOMAIN, translation_key="command_failed", translation_placeholders={"cmd": cmd})
    coordinator.force_full_refresh()
    await coordinator.async_request_refresh()


async def run_api(
    coordinator: DabstracterCoordinator,
    func: Callable[[dict[str, Any]], Awaitable[Any]],
    payload: dict[str, Any],
) -> dict[str, Any]:
    """POST /api/limit or /api/plan.

    With a password the session cookie is used. Without one the display token is tried: firmware
    2.8.110+ accepts it for these endpoints; older firmware answers 403, which becomes a clear
    "password needed" message.
    """
    try:
        result = await func(payload)
    except DabstracterForbiddenError as err:
        if not coordinator.api.has_password:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="password_required") from err
        raise _translate(err) from err
    except DabstracterError as err:
        raise _translate(err) from err
    coordinator.force_full_refresh()
    await coordinator.async_request_refresh()
    return result if isinstance(result, dict) else {}
