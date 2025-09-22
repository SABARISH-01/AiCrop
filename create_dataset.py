import pandas as pd
import numpy as np

# Define the number of samples
num_samples = 500

# Generate synthetic data
data = {
    'soil_ph': np.random.uniform(5.0, 8.0, num_samples),
    'avg_temp_last_month': np.random.uniform(10, 35, num_samples),
    'rainfall_last_month': np.random.uniform(20, 250, num_samples)
}

df = pd.DataFrame(data)
conditions = []

# Apply the same logic from our rule-based system to label the data
for index, row in df.iterrows():
    if row['avg_temp_last_month'] > 25 and row['rainfall_last_month'] > 150:
        conditions.append('Rice')
    elif 15 < row['avg_temp_last_month'] <= 25 and 50 < row['rainfall_last_month'] <= 100 and 6.0 < row['soil_ph'] < 7.5:
        conditions.append('Wheat')
    elif row['avg_temp_last_month'] > 25 and row['rainfall_last_month'] < 100:
        conditions.append('Cotton')
    elif row['avg_temp_last_month'] <= 15:
        conditions.append('Potato')
    else:
        conditions.append('Maize (Corn)')

df['crop'] = conditions

# Save the dataset to a CSV file
df.to_csv('crop_dataset.csv', index=False)

print("Dataset created successfully with 500 samples.")
print(df.head())
