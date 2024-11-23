from functools import cache

import pandas as pd
import polars as pl


@cache
def get_data() -> pl.DataFrame:
    return pd.read_csv("app/roberta2022_combined_states.csv", nrows=100_000)
