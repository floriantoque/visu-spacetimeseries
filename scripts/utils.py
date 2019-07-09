import datetime as libdt

import pandas as pd
import numpy as np

# Date functions
def build_timestamp_list(start, end, time_step_second=15*60):
    """
            Build a list of date between start and end with interval of time_step_second
            e.g., start = 2015-01-01 00:00:00, end = 2015-01-01 01:00:00, time_step_second = 30*60
            return : [2015-01-01 00:00:00, 2015-01-01 00:30:00, 2015-01-01 01:00:00]

            :param start: starting date with format "%Y-%m-%d %H:%M:%S"
            :param end: ending date with format "%Y-%m-%d %H:%M:%S"
            :param time_step_second:  second interval
            :return: list of date with format "%Y-%m-%d %H:%M:%S"

    """
    timestamp_list = [start]

    start = libdt.datetime.strptime(start, "%Y-%m-%d %H:%M:%S")
    end = libdt.datetime.strptime(end, "%Y-%m-%d %H:%M:%S") #+ libdt.timedelta(minutes=time_step_second)

    while start < end:
        start = start + libdt.timedelta(0, time_step_second)
        timestamp_list.append(libdt.datetime.strftime(start, "%Y-%m-%d %H:%M:%S"))
    return timestamp_list

# Aggregation functions, aggregate before normalize
def agg_max(m):
    """
            Select the maximum value of array m
            Aggregate before the normalization
            :param m: array m, float or int
    """
    return np.max(m)

def agg_min(m):
    """
            Select the minimum value of array m
            Aggregate before the normalization
            :param m: array m, float or int
    """
    return np.min(m)

def agg_maxabs_sign_at_n(m, n=1):
    """
            Select the farest value from 0 between the mean of the n greater
            values and the mean of the n lower values of array m
            Aggregate before the normalization
            :param m: array m, float or int
    """
    m_ = np.copy(m)
    m_.sort()
    a = np.array([m_[:n].mean(), m_[-n:].mean()])
    return max(a, key=lambda x: abs(x))

def agg_maxabs_sign_at_1(m):
    """
            Select the farest value from 0 between the greater
            value and the lower value of array m
            Aggregate before the normalization
            :param m: array m, float or int
    """
    return agg_maxabs_sign_at_n(m, n=1)

def agg_maxabs_sign_at_4(m):
    """
            Select the farest value from 0 between the mean of the 4 greater
            values and the mean of the 4 lower values of array m
            Aggregate before the normalization
            :param m: array m, float or int
    """
    return agg_maxabs_sign_at_n(m, n=4)

def agg_year_df(df, agg_f, index_='Datetime'):
    """
            Transform dataframe df with fine-grained resolution (multiple
            time steps per day) to dataframe with day resolution with the
            dimensionality reduction performed with the function agg_f
            Aggregate before the normalization
            :param df: dataframe with shape Datetime*Stops
            :param agg_f: aggregation (reduction) function
            :param index_: str index name of dataframe
    """
    days = sorted(list(set([i[:10] for i in df[index_].values])))
    df_ = df.copy()
    df_[index_] = [i[:10] for i in df_[index_].values]
    df_ = df_.set_index(index_)
    data = []
    for i in days:
        val=[]
        for j in df_.columns.values:
            m = agg_f(df_.loc[i,j].values)
            val.append(m)
        data.append(val)

    df_agg = pd.DataFrame(data=[[i]+list(j) for i,j in zip(days, data)],
                          columns=df.columns.values)
    return df_agg

# Normalization functions
def norm_allcolumns_allrows(df, index_='Datetime'):
    """
            Normalize the dataframe df by the max of absolute values of all the
            values of df
            :param df: dataframe with timesteps*stops format
            :index_: str index name of dataframe
    """
    df_ = df.set_index(index_).copy()
    df_ = (df_/np.max(np.abs(df_.values))).reset_index()
    return df_

def norm_allcolumns_perrow(df, index_='Datetime'):
    """
            Normalize the dataframe df per row over all the columns by the max
            of absolute values of each row values
            :param df: dataframe
            :index_: str index name of dataframe
    """
    df_ = df.set_index(index_).copy()
    for i in df_.index.values:
        df_.loc[i] = df_.loc[i]/np.max(np.abs(df_.loc[i].values))
    df_ = df_.reset_index()
    return df_

def norm_percolumn_allrows(df, index_='Datetime'):
    """
            Normalize the dataframe df per column over all the rows by the max
            of absolute values of each column values
            :param df: dataframe
            :index_: str index name of dataframe
    """
    df_ = df.set_index(index_).copy()
    for i in df_.columns.values:
        df_[i] = df_[i]/np.max(np.abs(df_[i].values))
    df_ = df_.reset_index()
    return df_

def norm_allcolumns_perday(df, index_='Datetime'):
    """
            Normalize the dataframe df per day over all the columns by the max
            of absolute values of each day values
            :param df: dataframe with index_ values with format "YYYY-MM-DD.."
            :index_: str index name of dataframe
    """
    df_ = df.copy()
    index_values = df_[index_].values.copy()
    df_[index_] = [i[:10] for i in df_[index_].values]
    df_ = df_.set_index(index_)
    for i in sorted(list(set(df_.index.tolist()))):
        df_.loc[i] = df_.loc[i] / np.max(np.abs(df_.loc[i].values))
    df_ = df_.reset_index()
    df_[index_] = index_values
    return df_

def norm_percolumn_perday(df, index_='Datetime'):
    """
            Normalize the dataframe df per column per day by the max
            of absolute values of each column and day values
            :param df: dataframe with index_ values with format "YYYY-MM-DD.."
            :index_: str index name of dataframe
    """
    df_ = df.copy()
    index_values = df_[index_].values.copy()
    df_[index_] = [i[:10] for i in df_[index_].values]
    df_ = df_.set_index(index_)
    for i in sorted(list(set(df_.index.tolist()))):
        for j in df_.columns.values:
            df_.loc[i,j] = df_.loc[i,j] /np.max(np.abs(df_.loc[i,j].values))
    df_ = df_.reset_index()
    df_[index_] = index_values
    return df_

def stack_df(df, index_='Datetime'):
    """
            Stack dataframe df with index index_
            :param df: dataframe with index_ index and columns corresponding to
            stop id
            :param index_: str index name of dataframe 
    """
    df_ = df.copy()
    df_ = df_.set_index('Datetime').stack().reset_index()
    df_.columns = [index_, 'stop_id', 'value']
    return df_
