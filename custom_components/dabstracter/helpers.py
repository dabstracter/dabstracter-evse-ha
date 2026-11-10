"""Shared command helper."""

from __future__ import annotations

from typing import Any

from homeassistant.exceptions import HomeAssistantError

from .api import DabstracterCommandError, DabstracterError, DabstracterForbiddenError
from .const import DOMAIN
from .coordinator import DabstracterCoordinator


async def run_command(coordinator: DabstracterCoordinator, cmd: str, **params: Any) -> None:
    """POST /api/cmd, translate errors, refresh soon."""
    try:
        ok = await coordinator.api.command(cmd, **params)
    except DabstracterForbiddenError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="forbidden", translation_placeholders={"msg": str(err)}
        ) from err
    except DabstracterCommandError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="rejected", translation_placeholders={"msg": str(err)}
        ) from err
    except DabstracterError as err:
        raise HomeAssistantError(
            translation_domain=DOMAIN, translation_key="comm_error", translation_placeholders={"msg": str(err)}
        ) from err
    if not ok:
        raise HomeAssistantError(translation_domain=DOMAIN, translation_key="command_failed", translation_placeholders={"cmd": cmd})
    coordinator.force_full_refresh()
    await coordinator.async_request_refresh()
