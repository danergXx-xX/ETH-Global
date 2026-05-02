"""Abstract DataSource protocol for all data adapters."""
from __future__ import annotations

from typing import Protocol, runtime_checkable

from schemas import Source


@runtime_checkable
class DataSource(Protocol):
    """Protocol that every data adapter must satisfy."""

    async def fetch(self, query: str, limit: int = 5) -> list[Source]:
        """Fetch sources matching query. Returns up to `limit` items."""
        ...

    @property
    def source_type(self) -> str:
        """Identifier: 'rss', 'coingecko', 'defillama', etc."""
        ...
