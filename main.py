"""
Python code is from Kinetic Component Analysis, Marcos López de Prado & Riccardo Rebonato - Journal of Investing (2016)
"""
import numpy as np
import yfinance as yf
from pydantic import BaseModel
from typing import List, Optional
from pykalman import KalmanFilter
from fastapi import FastAPI, HTTPException
from sklearn.preprocessing import StandardScaler

app = FastAPI()


class Data(BaseModel):
    t: List[float]
    z: List[float]
    q: float
    fwd: Optional[int] = 0


class FitKCAResponse(BaseModel):
    position: List[float]
    velocity: List[float]
    acceleration: List[float]


def fitKCA(t, z, q, fwd=0):
    """
    Inputs:
    t: Iterable with time indices
    z: Iterable with measurements
    q: Scalar that multiplies the seed states covariance
    fwd: number of steps to forecast (optional, default=0)
    Output:
    x[0]: smoothed state means of position velocity and acceleration
    x[1]: smoothed state covar of position velocity and acceleration
    Dependencies: numpy, pykalman
    """
    # 1) Set up matrices A,H and a seed for Q
    h = (t[-1] - t[0]) / t.shape[0]
    A = np.array([[1, h, 0.5 * h**2], [0, 1, h], [0, 0, 1]])
    Q = q * np.eye(A.shape[0])
    # 2) Apply the filter
    kf = KalmanFilter(transition_matrices=A, transition_covariance=Q)
    # 3) EM estimates
    kf = kf.em(z)
    # 4) Smooth
    x_mean, x_covar = kf.smooth(z)
    # 5) Forecast
    for fwd_ in range(fwd):
        x_mean_, x_covar_ = kf.filter_update(
            filtered_state_mean=x_mean[-1], filtered_state_covariance=x_covar[-1]
        )
        x_mean = np.append(x_mean, x_mean_.reshape(1, -1), axis=0)
        x_covar_ = np.expand_dims(x_covar_, axis=0)
        x_covar = np.append(x_covar, x_covar_, axis=0)
    # 6) Std series
    x_std = (x_covar[:, 0, 0] ** 0.5).reshape(-1, 1)
    for i in range(1, x_covar.shape[1]):
        x_std_ = x_covar[:, i, i] ** 0.5
        x_std = np.append(x_std, x_std_.reshape(-1, 1), axis=1)
    return x_mean, x_std, x_covar


def get_and_process_data(ticker_symbol, start_date, end_date):
    # Download data from yahoo!
    data = yf.download(ticker_symbol, start=start_date, end=end_date, progress=False)

    # Make data array
    z = data["Close"].values
    z = np.array(z)

    # z length
    size = len(z)

    # Scaling t
    t = np.linspace(0, np.pi * 10 / 2.0, size)
    t = np.array(t)

    # Scaling z
    z_scaled = np.array(z).reshape(-1, 1)
    z_scaled = StandardScaler().fit_transform(z_scaled)
    z = z_scaled.flatten()

    return t, z


@app.get("/fit_results")
def get_fit_results(ticker: str, start_date: str, end_date: str, q: float):
    try:
        t, z = get_and_process_data(ticker, start_date, end_date)
        x_point, x_bands = fitKCA(t=t, z=z, q=q)[:2]
        return FitKCAResponse(
            position=list(x_point[:, 0]),
            velocity=list(x_point[:, 1]),
            acceleration=list(x_point[:, 1]),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
