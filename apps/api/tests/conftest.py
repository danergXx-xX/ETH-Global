"""Pytest configuration and shared fixtures."""

import pytest


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "live: marks tests that call real Anthropic API")
    config.addinivalue_line("markers", "live_data: marks tests that call real data APIs (CoinGecko, DefiLlama, RSS)")
