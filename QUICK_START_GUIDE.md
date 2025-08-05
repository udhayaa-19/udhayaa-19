# BikeStores Data Analysis - Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:

```bash
# Required Python packages
pip install pandas openpyxl xlrd matplotlib seaborn plotly
```

Or using conda:
```bash
conda install pandas openpyxl xlrd matplotlib seaborn plotly
```

## 5-Minute Quick Start

### Step 1: Load the Data

```python
import pandas as pd
from pathlib import Path

# Load the BikeStores dataset
file_path = "BikeStores.xlsx - Data.xlsx"
df = pd.read_excel(file_path, sheet_name="BikeStores.xlsx - Data")

print(f"Dataset loaded successfully!")
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
```

### Step 2: Basic Data Exploration

```python
# Quick overview of the data
print("=== DATASET OVERVIEW ===")
print(f"Total Records: {len(df):,}")
print(f"Date Range: {df['order_date'].min()} to {df['order_date'].max()}")
print(f"Total Revenue: ${df['revenue'].sum():,.2f}")
print(f"Unique Customers: {df['customers'].nunique():,}")
print(f"Unique Products: {df['product_name'].nunique():,}")

# Show sample data
print("\n=== SAMPLE DATA ===")
print(df.head())
```

### Step 3: Quick Analysis

```python
# Top 5 customers by revenue
top_customers = df.groupby('customers')['revenue'].sum().sort_values(ascending=False).head()
print("\n=== TOP 5 CUSTOMERS ===")
print(top_customers)

# Top 5 products by revenue
top_products = df.groupby('product_name')['revenue'].sum().sort_values(ascending=False).head()
print("\n=== TOP 5 PRODUCTS ===")
print(top_products)

# Sales by state
state_sales = df.groupby('state')['revenue'].sum().sort_values(ascending=False)
print("\n=== SALES BY STATE ===")
print(state_sales)
```

### Step 4: Create a Simple Visualization

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set up the plotting style
plt.style.use('seaborn-v0_8')
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# 1. Revenue by State
state_revenue = df.groupby('state')['revenue'].sum().sort_values(ascending=False)
axes[0, 0].bar(state_revenue.index, state_revenue.values)
axes[0, 0].set_title('Revenue by State')
axes[0, 0].set_xlabel('State')
axes[0, 0].set_ylabel('Revenue ($)')
axes[0, 0].tick_params(axis='x', rotation=45)

# 2. Revenue by Category
category_revenue = df.groupby('category_name')['revenue'].sum().sort_values(ascending=False)
axes[0, 1].pie(category_revenue.values, labels=category_revenue.index, autopct='%1.1f%%')
axes[0, 1].set_title('Revenue Distribution by Category')

# 3. Monthly Sales Trend
df['order_month'] = pd.to_datetime(df['order_date']).dt.to_period('M')
monthly_sales = df.groupby('order_month')['revenue'].sum()
axes[1, 0].plot(monthly_sales.index.astype(str), monthly_sales.values, marker='o')
axes[1, 0].set_title('Monthly Sales Trend')
axes[1, 0].set_xlabel('Month')
axes[1, 0].set_ylabel('Revenue ($)')
axes[1, 0].tick_params(axis='x', rotation=45)

# 4. Top 10 Products
top_10_products = df.groupby('product_name')['revenue'].sum().sort_values(ascending=False).head(10)
axes[1, 1].barh(range(len(top_10_products)), top_10_products.values)
axes[1, 1].set_yticks(range(len(top_10_products)))
axes[1, 1].set_yticklabels([name[:30] + '...' if len(name) > 30 else name for name in top_10_products.index])
axes[1, 1].set_title('Top 10 Products by Revenue')
axes[1, 1].set_xlabel('Revenue ($)')

plt.tight_layout()
plt.show()
```

## Common Use Cases

### 1. Customer Analysis

```python
# Customer Lifetime Value Analysis
customer_analysis = df.groupby('customers').agg({
    'revenue': ['sum', 'mean', 'count'],
    'total_units': 'sum',
    'order_date': ['min', 'max']
}).round(2)

customer_analysis.columns = [
    'total_revenue', 'avg_order_value', 'order_count',
    'total_units', 'first_order', 'last_order'
]

# Calculate customer lifetime in days
customer_analysis['customer_lifetime_days'] = (
    pd.to_datetime(customer_analysis['last_order']) - 
    pd.to_datetime(customer_analysis['first_order'])
).dt.days

print("Top 10 Customers by Lifetime Value:")
print(customer_analysis.sort_values('total_revenue', ascending=False).head(10))
```

### 2. Product Performance Analysis

```python
# Product Performance Metrics
product_performance = df.groupby('product_name').agg({
    'revenue': ['sum', 'mean'],
    'total_units': 'sum',
    'order_id': 'count',
    'customers': 'nunique'
}).round(2)

product_performance.columns = [
    'total_revenue', 'avg_revenue_per_order',
    'units_sold', 'order_frequency', 'unique_customers'
]

# Calculate revenue per unit
product_performance['revenue_per_unit'] = (
    product_performance['total_revenue'] / product_performance['units_sold']
).round(2)

print("Top 10 Products by Performance:")
print(product_performance.sort_values('total_revenue', ascending=False).head(10))
```

### 3. Sales Representative Analysis

```python
# Sales Rep Performance
sales_rep_performance = df.groupby('sales_rep').agg({
    'revenue': ['sum', 'mean'],
    'total_units': 'sum',
    'customers': 'nunique',
    'order_id': 'count'
}).round(2)

sales_rep_performance.columns = [
    'total_sales', 'avg_sale_value',
    'units_sold', 'customers_served', 'transactions'
]

# Calculate sales efficiency metrics
sales_rep_performance['sales_per_customer'] = (
    sales_rep_performance['total_sales'] / sales_rep_performance['customers_served']
).round(2)

print("Sales Representative Performance:")
print(sales_rep_performance.sort_values('total_sales', ascending=False))
```

### 4. Time Series Analysis

```python
# Daily Sales Analysis
df['order_date'] = pd.to_datetime(df['order_date'])
daily_sales = df.groupby(df['order_date'].dt.date).agg({
    'revenue': 'sum',
    'total_units': 'sum',
    'order_id': 'count',
    'customers': 'nunique'
}).round(2)

daily_sales.columns = ['daily_revenue', 'daily_units', 'daily_orders', 'daily_customers']

# Calculate moving averages
daily_sales['revenue_7day_ma'] = daily_sales['daily_revenue'].rolling(window=7).mean()
daily_sales['revenue_30day_ma'] = daily_sales['daily_revenue'].rolling(window=30).mean()

print("Recent Daily Sales Trends:")
print(daily_sales.tail(10))
```

## Export Results

### Save Analysis to Excel

```python
# Create a comprehensive analysis Excel file
with pd.ExcelWriter('bikestores_analysis_results.xlsx', engine='openpyxl') as writer:
    # Summary statistics
    df.describe().to_excel(writer, sheet_name='Summary_Statistics')
    
    # Customer analysis
    customer_analysis.to_excel(writer, sheet_name='Customer_Analysis')
    
    # Product performance
    product_performance.to_excel(writer, sheet_name='Product_Performance')
    
    # Sales rep performance
    sales_rep_performance.to_excel(writer, sheet_name='Sales_Rep_Performance')
    
    # Daily sales
    daily_sales.to_excel(writer, sheet_name='Daily_Sales')

print("Analysis results saved to 'bikestores_analysis_results.xlsx'")
```

### Save Charts

```python
# Save the charts as high-resolution images
plt.savefig('bikestores_dashboard.png', dpi=300, bbox_inches='tight')
print("Dashboard saved as 'bikestores_dashboard.png'")
```

## Next Steps

1. **Explore Advanced Analytics**: Check out the full [API Documentation](API_DOCUMENTATION.md) for advanced analysis functions
2. **Create Interactive Dashboards**: Use Plotly or Streamlit for interactive visualizations
3. **Machine Learning**: Apply clustering for customer segmentation or forecasting for sales prediction
4. **Automated Reports**: Set up scheduled analysis and reporting workflows

## Troubleshooting

### Common Issues

1. **File Not Found**: Ensure the Excel file is in the correct directory
   ```python
   import os
   print("Current directory:", os.getcwd())
   print("Files in directory:", os.listdir("."))
   ```

2. **Import Errors**: Install missing packages
   ```bash
   pip install --upgrade pandas openpyxl xlrd
   ```

3. **Memory Issues**: For large datasets, use chunking
   ```python
   # Read data in chunks for large files
   chunk_size = 10000
   chunks = pd.read_excel(file_path, chunksize=chunk_size)
   df = pd.concat(chunks, ignore_index=True)
   ```

4. **Date Parsing Issues**: Explicitly specify date columns
   ```python
   df = pd.read_excel(file_path, parse_dates=['order_date'])
   ```

## Additional Resources

- [Full API Documentation](API_DOCUMENTATION.md)
- [Examples Repository](EXAMPLES.md)
- [Data Schema Reference](DATA_SCHEMA.md)

---

**Happy Analyzing! 🚴‍♂️📊**