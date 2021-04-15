# import dependencies
import math
import json
import pymongo
import requests
import numpy as np
import pandas as pd
from config import api_key
from pymongo import MongoClient
from datetime import date, datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM
import matplotlib.pyplot as plt
import plotly.express as px
plt.style.use('fivethirtyeight')

print("Retrieving NASDAQ 100 stock data")
# Retrieve NASDAQ 100 information from nasdaq_constituent API to retrieve stock symbols
# Set url 
url = "https://financialmodelingprep.com/api/v3/nasdaq_constituent?apikey="+ api_key

# Get response using requests.request("GET", url).json()
response = requests.request("GET", url).json()
print("NASDAQ 100 stock data received")

# Create empty list for global variables
stock_symbols = []
stock_date = []
close = []

# for loop through response to append symbol data
for r in response:
    # Isolate symbol data
    collect_symbols = r['symbol']
    # .append() collect_symbols to global variable stock_symbols
    stock_symbols.append(collect_symbols)
# Print symbol update to server    
print('Stock symbol data collected')

print("Connecting to MongoDB")
# Create connection to mongoDB
client = MongoClient('mongodb://localhost:27017')

# Set up database connection for databases in MongoDB
db = client.stock_db
six_months_db = client.six_months_stock_db
one_year_db = client.one_year_stock_db

# Set variables to collection names
stock_data = 'stock_data'
six_months = 'six_months'
one_year = 'one_year'

# Create function to gather stored data from MongoDB database
def get_stored_data(s, d, c):
    # print update to server
    print('------------------------')
    print(f'Collecting stored data for {s}')

    # Retrive data from mongoDB
    one_stock = d[c].find_one({'symbol': s})
    
    # Isolate symbol and historical data
    #symbol = one_stock['symbol']
    historical_data = one_stock['historical']

    #for loop through historical_data to retrive date and close data
    for h in historical_data:
        # Isolate date data
        collect_dates = h['date']
        # .append collected_dates to global variable stock_data
        stock_date.append(collect_dates)
        # Isolate close data
        collect_close = h['close']
        # .append collected_dates to global variable close
        close.append(collect_close)
    
    # print update to server
    print(f'Stored data collected for {s}')

# function to identify last date in MongoDB and append new data to database
def get_update(s, d, c, sd):
    # call get_stored_data() function to have access to stock_date and close data
    get_stored_data(s, d, c)

    # Create date variables for API request
    # Set variable for current date 
    current_date = date.today()
    #print(current_date)
    # Retrive last date stored in MongoDB
    last_date = max(sd)
    #print(last_date)

    # Create new_start_date to be a day after the last date
    # Turn last_date into date_time
    date_datetime = datetime.strptime(last_date, '%Y-%m-%d') 
    #print(date)
    # Using timedelta add 1 day to date_time
    modified_date = date_datetime + timedelta(days=1)
    #print(modified_date)
    # Turn variable from datetime back to date
    new_start_date = datetime.strftime(modified_date, '%Y-%m-%d')
    #print(new_start_date)

    # Set new url to retrieve new dates data
    url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{s}?from={new_start_date}&to={current_date}&apikey={api_key}"

    # Conditional statement to determine if an update query is needed
    # based on if last_data in MongDb < current_date being requested
    if str(last_date) < str(current_date):
        # Print update to server
        print(f"Last date in MongoDB for {s} is: {last_date}")
        # if so send new request fro url with new start and end date
        new_results = requests.request("GET", url).json()
        # Print update to server
        print(f"API Completed for {s}")
        #print(new_results)
        
        # Isolate historical data      	
        historical_data = new_results['historical']
        # Reverse date order 
        reversing_order = sorted(historical_data, key=lambda x: x['date'], reverse=False)
        # upload_ready reconstructed order
        upload_ready = {'symbol': s, 'historical': reversing_order}
        #print(upload_ready)
        # for loop through response to isolate list of dictionary to sort
        
	    # conditional statement to handle up to date data
        if not upload_ready:
            # Print update to server
            print(f"{s} data is up to date")
        else:
            # Print update to server
            print("Result not null. Retrieving new data")
            # Isolate historical data
            historical_update = upload_ready['historical']
            #for loop through historacal_update to retrive updated data
            for h in historical_update:
                # Retrieve new data       
                date_update = h['date']
                open_update = h['open']
                high_update = h['high']
                low_update = h['low']
                close_update = h['close']
                adjClose_update = h['adjClose']
                volume_update = h['volume']
                unadjustedVolume_update = h['unadjustedVolume']
                change_update = h['change']
                changePercent_update = h['changePercent']
                vwap_update = h['vwap']
                label_update = h['label']
                changeOverTime_update = h['changeOverTime']

                # Send update to MongoDb and push tp historical list
                d[c].update_one({'symbol': s}, {'$push': {'historical': {'date': date_update, 'open': open_update, 'high': high_update, 'low': low_update, 'close': close_update, 'adjClose': adjClose_update, 'volume': volume_update, 'unadjustedVolume': unadjustedVolume_update, 'change': change_update, 'changePercent': changePercent_update, 'vwap': vwap_update, 'label': label_update, 'changeOverTime': changeOverTime_update}}})
                # Print update to server
                print(f"{s} MongoDB update complete")  
    else:
        print(f"{s} Data is already up to date") 


def machine_learning(s, d, c, sd, cl):
    # Call on get_update() function which includes get_stored_data() function
    get_stored_data(s, d, c)
    # Print update to server
    print(f'Starting Machine Learning Model for {s}')
    # Store stock_date and close data into DataFrame
    df = pd.DataFrame({'Date': sd,'close': cl})

    df['Date'] = pd.to_datetime(df['Date'])

    # set 'Date' as index
    new_df = df.set_index('Date')

    # .shape dataframe
    new_df.shape

    # Create data variable for 'Close' column
    data = new_df.filter(['close'])

    # Convert df to a numpy array
    dataset = data.values
    
    # Get the number of rows to train the model on
    training_data_len = math.ceil(len(dataset) * .8)
    #training_data_len

    # Scale the data to apply preprocessing scaling before presenting to nueral network
    scaler = MinMaxScaler(feature_range=(0,1))
    scaled_data = scaler.fit_transform(dataset)
    # Show scaled data representing values between 0-1
    #scaled_data

    # Create the training dataset 
    # Create the scaled training dataset
    train_data = scaled_data[0:training_data_len , :]

    # Split the data into x_train and y_train data sets
    # x_train will be the independent training variables
    # y_train will be the dependent variables
    x_train = []
    y_train = []

    for i in range(60, len(train_data)):
        # Append past 60 values to x_train
        # contains 60 vals index from position 0 to position 59
        x_train.append(train_data[i-60:i, 0])

        #y_train will contain the 61st value 
        y_train.append(train_data[i,0])

        # Run below to visualize the x & y trains. x should be an array of 60 values and y should be 1 value being the 61st
        # Changing to if i<=61 will provide a 2nd pass through
        #if i<=60:
            # print(x_train)
            # print(y_train)
            # print()   


    # Convert x_train & y_train to numpy arrays  so we can use them for training the LSTM model
    x_train, y_train = np.array(x_train), np.array(y_train)

    # Reshape the data because LSTM network expects input to be 3 dimensional and as of now our x_train is 2D
    # number of sample(rows), timesteps(columns), and features(closing price)
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))
    x_train.shape

    # Build LSTM model
    model = Sequential()
    # add LSTM with 50 neurons 
    model.add(LSTM(50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
    model.add(LSTM(50, return_sequences=False))
    model.add(Dense(25))
    model.add(Dense(1))

    # Compile the model
    model.compile(optimizer='adam', loss='mean_squared_error')

    # Train the model
    model.fit(x_train, y_train, batch_size=1, epochs=1)

    # Create testing dataset
    # Create new array containing scaled values from index 2057 to 2646
    test_data = scaled_data[training_data_len - 60: , :]

    # Create the data sets x_test and y_test
    x_test = []
    # y_test contains actual 61st values (not scaled)
    y_test = dataset[training_data_len: , :]

    for i in range(60, len(test_data)):
        x_test.append(test_data[i-60:i, 0])

    # Convert data to numpy array to use is LSTM model
    x_test = np.array(x_test)
    
    # Reshape the data because data is 2D and we need 3D for LSTM
    # number of samples(rows), timesteps(col), features(closing price)
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1))
    
    # Get the models predicted price values for x_test dataset
    predictions = model.predict(x_test)
    predictions = scaler.inverse_transform(predictions)

    # Get the root mean squared error. Closer to 0 the better
    rmse = np.sqrt(np.mean(predictions - y_test) **2)
    #rmse

    # Plot the data
    train = data[:training_data_len]
    valid = data[training_data_len:]
    valid['Predictions'] = predictions

    # Print update to server
    print(f'Prediction results complete for {s}')

    # Print update to server
    print(f"Processing {s}'s predictions data")
    # reset_index for df so that date is no longer and index
    index_valid = valid.reset_index()
    # Convert index_valid back to a DataFrame
    index_valid_df = pd.DataFrame(index_valid).drop_duplicates()
    #index_valid_df.head()
    
    # Create stock_date variable from index_valid_df on 'Date'
    stock_date = index_valid_df['Date']

    # Create empty list to store only date values
    stock_date_list = []
    # for look through stock_date
    for stock in stock_date:
        # collect_dates data
        collect_dates = stock
        # Convert collect_dates data from datetime to date
        clean_dates = datetime.strftime(collect_dates, '%Y-%m-%d')
        
        # .append clean_dates to stock_date_list
        stock_date_list.append(clean_dates)

    #print(stock_date_list)

    # Create close_data variable from index_valid_df on 'close'
    close_data = index_valid_df['close']
    # Create empty list to store only close values
    close_data_list = []
    # for look through close_data
    for close in close_data:
        # collect_close data
        collect_close = close
        # .append collect_close to close_data_list
        close_data_list.append(collect_close)

    #close_data_list

    # Create predictions_data variable from index_valid_df on 'Predictions'
    predictions_data = index_valid_df['Predictions']
    # Create empty list to store only predictions values

    predicted_data_list = []
    # for loop through predictions_data
    for predict in predictions_data:
        # collect_predict data
        collect_predict = predict
        # .append collect_predict to predicted_data_list
        predicted_data_list.append(collect_predict)

    # Create dictionary with prediction results to store in MongoDB
    prediction_data = {
    'Date': stock_date_list,
    'Actual Close': close_data_list,
    'Predictions': predicted_data_list
    }

    # Get current_date to store with results to keep track per day
    current_date = date.today().strftime('%Y-%m-%d')
    #print(current_date)

    if not prediction_data:
        print("No prediction data")
    else:
        #d[c].update_one({'symbol': s}, {'$push': {'prediction': {'date': current_date, 'prediction_data': prediction_data}}})
        print(f"{s}'s predictions stored in MongoDB")
        print('------------------------------------')

########################################################### 
#   Suggest running one for loop at a time.               #
#   In regards to prameters:                              #
#   s = symbol                                            #
#   d = database_name (for six_months_db or one_year_db)  #
#   c = collection_name (for six_months or one_year )     #
#   sd = stock_date                                       #
#   cl = close                                            #
#   get_stored_data(s, d, c)                              #
#   get_update(s, d, c, sd)                               #
#   machine_learning(s, d, c, sd, cl)                     #  
###########################################################

# Run to retrieve stored data
# for stock in stock_symbols:

#     get_stored_data(stock, six_months_db, six_months)

# Run to retrieve stored data and append new updated data
# for stock in stock_symbols:

#     get_update(stock, six_months_db, six_months, stock_date)

# Run to retrieve stored data and create prediction data
# for stock in stock_symbols:

#     machine_learning(stock, six_months_db, six_months, stock_date, close)

