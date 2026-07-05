from pathlib import Path
import asyncio

import pandas as pd

import main


def test_lifespan_loads_files_relative_to_module(monkeypatch):
    loaded_paths = []
    module_dir = Path(main.__file__).resolve().parent

    monkeypatch.chdir(module_dir.parent)
    monkeypatch.setattr(main.joblib, "load", lambda path: loaded_paths.append(Path(path)) or {"path": Path(path)})
    monkeypatch.setattr(main.pd, "read_csv", lambda path: pd.DataFrame([{"path": str(path)}]))

    async def run():
        async with main.lifespan(None):
            pass

    asyncio.run(run())

    assert loaded_paths == [
        module_dir / "model" / "model_solar_prediction.pkl",
        module_dir / "model" / "model_info.pkl",
    ]