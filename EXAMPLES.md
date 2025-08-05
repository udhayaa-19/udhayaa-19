# BikeStores Data Analysis - Examples & Use Cases

This document provides comprehensive examples and use cases for analyzing the BikeStores dataset. Each example includes complete, runnable code with explanations.

## Table of Contents

1. [Basic Analytics Examples](#basic-analytics-examples)
2. [Advanced Analytics](#advanced-analytics)
3. [Business Intelligence Scenarios](#business-intelligence-scenarios)
4. [Visualization Examples](#visualization-examples)
5. [Machine Learning Applications](#machine-learning-applications)
6. [Reporting & Automation](#reporting--automation)

---

## Basic Analytics Examples

### Example 1: Revenue Analysis by Multiple Dimensions

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
df = pd.read_excel("BikeStores.xlsx - Data.xlsx", sheet_name="BikeStores.xlsx - Data")

def multi_dimensional_revenue_analysis(df):
    """
    Comprehensive revenue analysis across multiple dimensions
    """
    print("=== MULTI-DIMENSIONAL REVENUE ANALYSIS ===\n")
    
    # 1. Overall metrics
    total_revenue = df['revenue'].sum()
    avg_order_value = df['revenue'].mean()
    total_orders = len(df)
    
    print(f"📊 OVERALL METRICS")
    print(f"Total Revenue: ${total_revenue:,.2f}")
    print(f"Average Order Value: ${avg_order_value:.2f}")
    print(f"Total Orders: {total_orders:,}")
    print(f"Revenue per Order: ${total_revenue/total_orders:.2f}\n")
    
    # 2. Revenue by State
    state_analysis = df.groupby('state').agg({
        'revenue': ['sum', 'mean', 'count'],
        'customers': 'nunique'
    }).round(2)
    
    state_analysis.columns = ['total_revenue', 'avg_order_value', 'order_count', 'unique_customers']
    state_analysis['revenue_per_customer'] = (state_analysis['total_revenue'] / 
                                            state_analysis['unique_customers']).round(2)
    
    print("🌎 REVENUE BY STATE")
    print(state_analysis.sort_values('total_revenue', ascending=False))
    print()
    
    # 3. Revenue by Category and Brand
    category_brand_analysis = df.groupby(['category_name', 'brand_name'])['revenue'].agg([
        'sum', 'count', 'mean'
    ]).round(2)
    
    print("🏷️  TOP CATEGORY-BRAND COMBINATIONS")
    print(category_brand_analysis.sort_values('sum', ascending=False).head(10))
    print()
    
    # 4. Temporal analysis
    df['order_date'] = pd.to_datetime(df['order_date'])
    df['month'] = df['order_date'].dt.month
    df['quarter'] = df['order_date'].dt.quarter
    
    monthly_revenue = df.groupby('month')['revenue'].sum()
    quarterly_revenue = df.groupby('quarter')['revenue'].sum()
    
    print("📅 SEASONAL ANALYSIS")
    print("Monthly Revenue:")
    print(monthly_revenue)
    print("\nQuarterly Revenue:")
    print(quarterly_revenue)
    
    return {
        'state_analysis': state_analysis,
        'category_brand_analysis': category_brand_analysis,
        'monthly_revenue': monthly_revenue,
        'quarterly_revenue': quarterly_revenue
    }

# Run the analysis
results = multi_dimensional_revenue_analysis(df)
```

### Example 2: Customer Segmentation Analysis

```python
def customer_segmentation_rfm(df):
    """
    RFM (Recency, Frequency, Monetary) Analysis for Customer Segmentation
    """
    from datetime import datetime
    
    # Prepare data
    df['order_date'] = pd.to_datetime(df['order_date'])
    current_date = df['order_date'].max() + pd.Timedelta(days=1)
    
    # Calculate RFM metrics
    rfm = df.groupby('customers').agg({
        'order_date': lambda x: (current_date - x.max()).days,  # Recency
        'order_id': 'count',  # Frequency
        'revenue': 'sum'  # Monetary
    }).round(2)
    
    rfm.columns = ['Recency', 'Frequency', 'Monetary']
    
    # Calculate RFM scores (1-5 scale)
    rfm['R_Score'] = pd.qcut(rfm['Recency'], 5, labels=[5,4,3,2,1])
    rfm['F_Score'] = pd.qcut(rfm['Frequency'].rank(method='first'), 5, labels=[1,2,3,4,5])
    rfm['M_Score'] = pd.qcut(rfm['Monetary'], 5, labels=[1,2,3,4,5])
    
    # Combine scores
    rfm['RFM_Score'] = rfm['R_Score'].astype(str) + rfm['F_Score'].astype(str) + rfm['M_Score'].astype(str)
    
    # Define customer segments
    def segment_customers(score):
        if score in ['555', '554', '544', '545', '454', '455', '445']:
            return 'Champions'
        elif score in ['543', '444', '435', '355', '354', '345', '344', '335']:
            return 'Loyal Customers'
        elif score in ['512', '511', '422', '421', '412', '411', '311']:
            return 'Potential Loyalists'
        elif score in ['535', '534', '443', '434', '343', '334', '325', '324']:
            return 'New Customers'
        elif score in ['155', '154', '144', '214', '215', '115', '114']:
            return 'At Risk'
        elif score in ['125', '124', '123', '122', '121', '131', '141']:
            return 'Cannot Lose Them'
        elif score in ['111', '112', '113', '211', '212', '213']:
            return 'Lost Customers'
        else:
            return 'Others'
    
    rfm['Segment'] = rfm['RFM_Score'].apply(segment_customers)
    
    # Segment analysis
    segment_analysis = rfm.groupby('Segment').agg({
        'Recency': 'mean',
        'Frequency': 'mean',
        'Monetary': ['mean', 'sum', 'count']
    }).round(2)
    
    print("🎯 CUSTOMER SEGMENTATION ANALYSIS (RFM)")
    print("=" * 50)
    print(f"Total Customers Analyzed: {len(rfm):,}")
    print(f"Analysis Date: {current_date.strftime('%Y-%m-%d')}")
    print()
    
    print("Segment Distribution:")
    segment_counts = rfm['Segment'].value_counts()
    for segment, count in segment_counts.items():
        percentage = (count / len(rfm)) * 100
        print(f"{segment}: {count:,} customers ({percentage:.1f}%)")
    
    print("\nSegment Metrics:")
    print(segment_analysis)
    
    return rfm, segment_analysis

# Run customer segmentation
rfm_results, segment_stats = customer_segmentation_rfm(df)
```

## Advanced Analytics

### Example 3: Product Performance Deep Dive

```python
def advanced_product_analysis(df):
    """
    Advanced product performance analysis with cross-selling insights
    """
    
    # 1. Product Performance Matrix
    product_metrics = df.groupby('product_name').agg({
        'revenue': ['sum', 'mean', 'std'],
        'total_units': 'sum',
        'order_id': 'count',
        'customers': 'nunique'
    }).round(2)
    
    product_metrics.columns = [
        'total_revenue', 'avg_revenue_per_order', 'revenue_std',
        'units_sold', 'order_frequency', 'unique_customers'
    ]
    
    # Calculate additional metrics
    product_metrics['revenue_per_unit'] = (product_metrics['total_revenue'] / 
                                         product_metrics['units_sold']).round(2)
    product_metrics['customer_penetration'] = (product_metrics['unique_customers'] / 
                                             df['customers'].nunique() * 100).round(2)
    product_metrics['repeat_purchase_rate'] = (
        (product_metrics['order_frequency'] - product_metrics['unique_customers']) / 
        product_metrics['unique_customers'] * 100
    ).round(2)
    
    # 2. Product Category Analysis
    category_performance = df.groupby('category_name').agg({
        'revenue': 'sum',
        'total_units': 'sum',
        'product_name': 'nunique',
        'customers': 'nunique'
    }).round(2)
    
    category_performance['avg_revenue_per_product'] = (
        category_performance['revenue'] / category_performance['product_name']
    ).round(2)
    
    # 3. Brand Performance Analysis
    brand_performance = df.groupby('brand_name').agg({
        'revenue': ['sum', 'mean'],
        'total_units': 'sum',
        'product_name': 'nunique',
        'customers': 'nunique'
    }).round(2)
    
    brand_performance.columns = [
        'total_revenue', 'avg_revenue_per_sale',
        'units_sold', 'product_count', 'customer_count'
    ]
    
    # 4. Market Basket Analysis (simplified)
    customer_products = df.groupby('customers')['product_name'].apply(list).reset_index()
    
    # Find frequently bought together products
    from itertools import combinations
    
    product_pairs = []
    for products in customer_products['product_name']:
        if len(products) > 1:
            for pair in combinations(set(products), 2):
                product_pairs.append(tuple(sorted(pair)))
    
    pair_counts = pd.Series(product_pairs).value_counts().head(10)
    
    print("🔍 ADVANCED PRODUCT ANALYSIS")
    print("=" * 50)
    
    print("\n📈 TOP 10 PRODUCTS BY REVENUE:")
    top_products = product_metrics.sort_values('total_revenue', ascending=False).head(10)
    print(top_products[['total_revenue', 'units_sold', 'revenue_per_unit', 'customer_penetration']])
    
    print("\n🏷️  CATEGORY PERFORMANCE:")
    print(category_performance.sort_values('revenue', ascending=False))
    
    print("\n🏭 BRAND PERFORMANCE:")
    print(brand_performance.sort_values('total_revenue', ascending=False))
    
    print("\n🛒 FREQUENTLY BOUGHT TOGETHER (TOP 10 PAIRS):")
    for (product1, product2), count in pair_counts.items():
        print(f"{product1[:30]}... + {product2[:30]}...: {count} customers")
    
    return {
        'product_metrics': product_metrics,
        'category_performance': category_performance,
        'brand_performance': brand_performance,
        'product_pairs': pair_counts
    }

# Run advanced product analysis
product_insights = advanced_product_analysis(df)
```

### Example 4: Geographic Sales Analysis

```python
def geographic_sales_analysis(df):
    """
    Comprehensive geographic analysis of sales performance
    """
    
    # 1. State-level analysis
    state_analysis = df.groupby('state').agg({
        'revenue': ['sum', 'mean'],
        'total_units': 'sum',
        'customers': 'nunique',
        'order_id': 'count',
        'sales_rep': 'nunique'
    }).round(2)
    
    state_analysis.columns = [
        'total_revenue', 'avg_order_value', 'units_sold',
        'customer_count', 'order_count', 'sales_rep_count'
    ]
    
    # Calculate performance metrics
    state_analysis['revenue_per_customer'] = (
        state_analysis['total_revenue'] / state_analysis['customer_count']
    ).round(2)
    
    state_analysis['orders_per_customer'] = (
        state_analysis['order_count'] / state_analysis['customer_count']
    ).round(2)
    
    state_analysis['revenue_per_sales_rep'] = (
        state_analysis['total_revenue'] / state_analysis['sales_rep_count']
    ).round(2)
    
    # 2. City-level analysis (top cities)
    city_analysis = df.groupby(['state', 'city']).agg({
        'revenue': 'sum',
        'customers': 'nunique',
        'order_id': 'count'
    }).round(2)
    
    city_analysis.columns = ['total_revenue', 'customer_count', 'order_count']
    city_analysis = city_analysis.sort_values('total_revenue', ascending=False)
    
    # 3. Store performance by location
    store_location_analysis = df.groupby(['store_name', 'state', 'city']).agg({
        'revenue': ['sum', 'mean'],
        'customers': 'nunique',
        'product_name': 'nunique',
        'sales_rep': 'nunique'
    }).round(2)
    
    store_location_analysis.columns = [
        'total_revenue', 'avg_order_value', 'customer_count',
        'product_variety', 'sales_team_size'
    ]
    
    print("🗺️  GEOGRAPHIC SALES ANALYSIS")
    print("=" * 50)
    
    print("\n🏛️  STATE-LEVEL PERFORMANCE:")
    print(state_analysis.sort_values('total_revenue', ascending=False))
    
    print("\n🏙️  TOP 15 CITIES BY REVENUE:")
    print(city_analysis.head(15))
    
    print("\n🏪 STORE PERFORMANCE BY LOCATION:")
    print(store_location_analysis.sort_values('total_revenue', ascending=False))
    
    # Geographic distribution insights
    total_revenue = df['revenue'].sum()
    print(f"\n📊 GEOGRAPHIC DISTRIBUTION INSIGHTS:")
    print(f"Total States: {df['state'].nunique()}")
    print(f"Total Cities: {df['city'].nunique()}")
    print(f"Top State Revenue Share: {state_analysis['total_revenue'].iloc[0]/total_revenue*100:.1f}%")
    print(f"Top 3 States Revenue Share: {state_analysis['total_revenue'].head(3).sum()/total_revenue*100:.1f}%")
    
    return {
        'state_analysis': state_analysis,
        'city_analysis': city_analysis,
        'store_location_analysis': store_location_analysis
    }

# Run geographic analysis
geo_insights = geographic_sales_analysis(df)
```

## Business Intelligence Scenarios

### Example 5: Executive Dashboard Metrics

```python
def executive_dashboard(df):
    """
    Generate executive-level KPIs and insights
    """
    from datetime import datetime, timedelta
    
    # Convert dates
    df['order_date'] = pd.to_datetime(df['order_date'])
    
    # Define time periods
    latest_date = df['order_date'].max()
    current_month = latest_date.replace(day=1)
    previous_month = (current_month - timedelta(days=1)).replace(day=1)
    current_quarter_start = latest_date.replace(month=((latest_date.month-1)//3)*3+1, day=1)
    
    # 1. Overall KPIs
    total_revenue = df['revenue'].sum()
    total_customers = df['customers'].nunique()
    total_orders = df['order_id'].nunique()
    avg_order_value = df['revenue'].mean()
    
    # 2. Growth metrics (simplified - would need historical data for real growth)
    current_month_data = df[df['order_date'] >= current_month]
    previous_month_data = df[(df['order_date'] >= previous_month) & 
                           (df['order_date'] < current_month)]
    
    current_month_revenue = current_month_data['revenue'].sum()
    previous_month_revenue = previous_month_data['revenue'].sum()
    
    if previous_month_revenue > 0:
        mom_growth = ((current_month_revenue - previous_month_revenue) / 
                     previous_month_revenue * 100)
    else:
        mom_growth = 0
    
    # 3. Top performers
    top_customers = df.groupby('customers')['revenue'].sum().sort_values(ascending=False).head(5)
    top_products = df.groupby('product_name')['revenue'].sum().sort_values(ascending=False).head(5)
    top_sales_reps = df.groupby('sales_rep')['revenue'].sum().sort_values(ascending=False).head(5)
    
    # 4. Market insights
    category_distribution = df.groupby('category_name')['revenue'].sum().sort_values(ascending=False)
    brand_market_share = df.groupby('brand_name')['revenue'].sum().sort_values(ascending=False)
    
    # 5. Operational metrics
    avg_units_per_order = df['total_units'].mean()
    revenue_per_unit = (df['revenue'] / df['total_units']).mean()
    
    print("📋 EXECUTIVE DASHBOARD")
    print("=" * 60)
    print(f"📅 Report Date: {latest_date.strftime('%Y-%m-%d')}")
    print()
    
    print("💰 KEY FINANCIAL METRICS")
    print(f"Total Revenue: ${total_revenue:,.2f}")
    print(f"Average Order Value: ${avg_order_value:.2f}")
    print(f"Revenue per Unit: ${revenue_per_unit:.2f}")
    print(f"Month-over-Month Growth: {mom_growth:+.1f}%")
    print()
    
    print("👥 CUSTOMER METRICS")
    print(f"Total Customers: {total_customers:,}")
    print(f"Total Orders: {total_orders:,}")
    print(f"Orders per Customer: {total_orders/total_customers:.2f}")
    print(f"Revenue per Customer: ${total_revenue/total_customers:.2f}")
    print()
    
    print("🏆 TOP PERFORMERS")
    print("\nTop 5 Customers by Revenue:")
    for customer, revenue in top_customers.items():
        print(f"  {customer}: ${revenue:,.2f}")
    
    print("\nTop 5 Products by Revenue:")
    for product, revenue in top_products.items():
        product_short = product[:40] + "..." if len(product) > 40 else product
        print(f"  {product_short}: ${revenue:,.2f}")
    
    print("\nTop 5 Sales Representatives:")
    for rep, revenue in top_sales_reps.items():
        print(f"  {rep}: ${revenue:,.2f}")
    
    print("\n📊 MARKET INSIGHTS")
    print("\nRevenue by Category:")
    for category, revenue in category_distribution.items():
        percentage = (revenue / total_revenue) * 100
        print(f"  {category}: ${revenue:,.2f} ({percentage:.1f}%)")
    
    print("\n🏭 BRAND PERFORMANCE")
    for brand, revenue in brand_market_share.head().items():
        percentage = (revenue / total_revenue) * 100
        print(f"  {brand}: ${revenue:,.2f} ({percentage:.1f}%)")
    
    return {
        'kpis': {
            'total_revenue': total_revenue,
            'total_customers': total_customers,
            'total_orders': total_orders,
            'avg_order_value': avg_order_value,
            'mom_growth': mom_growth
        },
        'top_performers': {
            'customers': top_customers,
            'products': top_products,
            'sales_reps': top_sales_reps
        },
        'market_insights': {
            'category_distribution': category_distribution,
            'brand_market_share': brand_market_share
        }
    }

# Generate executive dashboard
dashboard_data = executive_dashboard(df)
```

## Visualization Examples

### Example 6: Comprehensive Visualization Suite

```python
def create_comprehensive_visualizations(df):
    """
    Create a comprehensive set of visualizations for business insights
    """
    import matplotlib.pyplot as plt
    import seaborn as sns
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    
    # Set up the plotting style
    plt.style.use('seaborn-v0_8')
    sns.set_palette("husl")
    
    # Create a large figure with multiple subplots
    fig, axes = plt.subplots(3, 3, figsize=(20, 18))
    fig.suptitle('BikeStores Comprehensive Analytics Dashboard', fontsize=20, fontweight='bold')
    
    # 1. Revenue by State (Bar Chart)
    state_revenue = df.groupby('state')['revenue'].sum().sort_values(ascending=False)
    axes[0, 0].bar(state_revenue.index, state_revenue.values, color='skyblue')
    axes[0, 0].set_title('Revenue by State', fontweight='bold')
    axes[0, 0].set_xlabel('State')
    axes[0, 0].set_ylabel('Revenue ($)')
    axes[0, 0].tick_params(axis='x', rotation=45)
    
    # 2. Category Distribution (Pie Chart)
    category_revenue = df.groupby('category_name')['revenue'].sum()
    axes[0, 1].pie(category_revenue.values, labels=category_revenue.index, autopct='%1.1f%%')
    axes[0, 1].set_title('Revenue Distribution by Category', fontweight='bold')
    
    # 3. Monthly Sales Trend (Line Chart)
    df['order_date'] = pd.to_datetime(df['order_date'])
    monthly_sales = df.groupby(df['order_date'].dt.to_period('M'))['revenue'].sum()
    axes[0, 2].plot(monthly_sales.index.astype(str), monthly_sales.values, marker='o', linewidth=2)
    axes[0, 2].set_title('Monthly Sales Trend', fontweight='bold')
    axes[0, 2].set_xlabel('Month')
    axes[0, 2].set_ylabel('Revenue ($)')
    axes[0, 2].tick_params(axis='x', rotation=45)
    
    # 4. Top 10 Products (Horizontal Bar)
    top_products = df.groupby('product_name')['revenue'].sum().sort_values(ascending=True).tail(10)
    axes[1, 0].barh(range(len(top_products)), top_products.values, color='lightcoral')
    axes[1, 0].set_yticks(range(len(top_products)))
    axes[1, 0].set_yticklabels([name[:25] + '...' if len(name) > 25 else name for name in top_products.index])
    axes[1, 0].set_title('Top 10 Products by Revenue', fontweight='bold')
    axes[1, 0].set_xlabel('Revenue ($)')
    
    # 5. Customer Distribution by State (Stacked Bar)
    customer_state = df.groupby(['state', 'customers']).size().unstack(fill_value=0)
    customer_counts = df.groupby('state')['customers'].nunique().sort_values(ascending=False)
    axes[1, 1].bar(customer_counts.index, customer_counts.values, color='gold')
    axes[1, 1].set_title('Customer Count by State', fontweight='bold')
    axes[1, 1].set_xlabel('State')
    axes[1, 1].set_ylabel('Number of Customers')
    axes[1, 1].tick_params(axis='x', rotation=45)
    
    # 6. Sales Rep Performance (Scatter Plot)
    rep_performance = df.groupby('sales_rep').agg({
        'revenue': 'sum',
        'customers': 'nunique'
    })
    axes[1, 2].scatter(rep_performance['customers'], rep_performance['revenue'], alpha=0.7, s=100)
    axes[1, 2].set_title('Sales Rep Performance: Revenue vs Customers', fontweight='bold')
    axes[1, 2].set_xlabel('Number of Customers Served')
    axes[1, 2].set_ylabel('Total Revenue ($)')
    
    # 7. Brand Performance (Bar Chart)
    brand_revenue = df.groupby('brand_name')['revenue'].sum().sort_values(ascending=False).head(10)
    axes[2, 0].bar(range(len(brand_revenue)), brand_revenue.values, color='lightgreen')
    axes[2, 0].set_xticks(range(len(brand_revenue)))
    axes[2, 0].set_xticklabels(brand_revenue.index, rotation=45, ha='right')
    axes[2, 0].set_title('Top 10 Brands by Revenue', fontweight='bold')
    axes[2, 0].set_ylabel('Revenue ($)')
    
    # 8. Order Value Distribution (Histogram)
    axes[2, 1].hist(df['revenue'], bins=30, alpha=0.7, color='purple', edgecolor='black')
    axes[2, 1].set_title('Order Value Distribution', fontweight='bold')
    axes[2, 1].set_xlabel('Order Value ($)')
    axes[2, 1].set_ylabel('Frequency')
    
    # 9. Units Sold vs Revenue (Scatter)
    axes[2, 2].scatter(df['total_units'], df['revenue'], alpha=0.5, s=50)
    axes[2, 2].set_title('Units Sold vs Revenue Relationship', fontweight='bold')
    axes[2, 2].set_xlabel('Units Sold')
    axes[2, 2].set_ylabel('Revenue ($)')
    
    # Adjust layout
    plt.tight_layout()
    plt.show()
    
    # Save the dashboard
    fig.savefig('comprehensive_dashboard.png', dpi=300, bbox_inches='tight')
    print("📊 Dashboard saved as 'comprehensive_dashboard.png'")
    
    return fig

# Create visualizations
dashboard_fig = create_comprehensive_visualizations(df)
```

### Example 7: Interactive Plotly Dashboard

```python
def create_interactive_dashboard(df):
    """
    Create an interactive dashboard using Plotly
    """
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    
    # Prepare data
    df['order_date'] = pd.to_datetime(df['order_date'])
    
    # Create subplots
    fig = make_subplots(
        rows=3, cols=2,
        subplot_titles=(
            'Revenue by State', 'Monthly Sales Trend',
            'Category Performance', 'Top 10 Products',
            'Sales Rep Performance', 'Geographic Distribution'
        ),
        specs=[[{"type": "bar"}, {"type": "scatter"}],
               [{"type": "bar"}, {"type": "bar"}],
               [{"type": "scatter"}, {"type": "bar"}]]
    )
    
    # 1. Revenue by State
    state_revenue = df.groupby('state')['revenue'].sum().sort_values(ascending=False)
    fig.add_trace(
        go.Bar(x=state_revenue.index, y=state_revenue.values, name='State Revenue',
               marker_color='lightblue'),
        row=1, col=1
    )
    
    # 2. Monthly Sales Trend
    monthly_sales = df.groupby(df['order_date'].dt.to_period('M'))['revenue'].sum()
    fig.add_trace(
        go.Scatter(x=monthly_sales.index.astype(str), y=monthly_sales.values,
                   mode='lines+markers', name='Monthly Sales', line=dict(color='red')),
        row=1, col=2
    )
    
    # 3. Category Performance
    category_revenue = df.groupby('category_name')['revenue'].sum().sort_values(ascending=False)
    fig.add_trace(
        go.Bar(x=category_revenue.index, y=category_revenue.values,
               name='Category Revenue', marker_color='lightgreen'),
        row=2, col=1
    )
    
    # 4. Top 10 Products
    top_products = df.groupby('product_name')['revenue'].sum().sort_values(ascending=False).head(10)
    product_names_short = [name[:20] + '...' if len(name) > 20 else name for name in top_products.index]
    fig.add_trace(
        go.Bar(x=product_names_short, y=top_products.values,
               name='Product Revenue', marker_color='orange'),
        row=2, col=2
    )
    
    # 5. Sales Rep Performance
    rep_performance = df.groupby('sales_rep').agg({
        'revenue': 'sum',
        'customers': 'nunique'
    })
    fig.add_trace(
        go.Scatter(x=rep_performance['customers'], y=rep_performance['revenue'],
                   mode='markers', name='Sales Rep Performance',
                   marker=dict(size=10, color='purple')),
        row=3, col=1
    )
    
    # 6. Geographic Distribution (Customer Count by State)
    customer_counts = df.groupby('state')['customers'].nunique().sort_values(ascending=False)
    fig.add_trace(
        go.Bar(x=customer_counts.index, y=customer_counts.values,
               name='Customer Count', marker_color='gold'),
        row=3, col=2
    )
    
    # Update layout
    fig.update_layout(
        title_text="BikeStores Interactive Analytics Dashboard",
        title_x=0.5,
        height=1200,
        showlegend=False
    )
    
    # Update x-axis labels for better readability
    fig.update_xaxes(tickangle=45)
    
    # Show the interactive dashboard
    fig.show()
    
    # Save as HTML
    fig.write_html("interactive_dashboard.html")
    print("🌐 Interactive dashboard saved as 'interactive_dashboard.html'")
    
    return fig

# Create interactive dashboard
interactive_fig = create_interactive_dashboard(df)
```

## Machine Learning Applications

### Example 8: Customer Clustering

```python
def customer_clustering_analysis(df):
    """
    Apply machine learning clustering to segment customers
    """
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    import matplotlib.pyplot as plt
    
    # Prepare customer features
    customer_features = df.groupby('customers').agg({
        'revenue': ['sum', 'mean', 'count'],
        'total_units': 'sum',
        'order_date': lambda x: (df['order_date'].max() - x.max()).days
    }).round(2)
    
    customer_features.columns = [
        'total_spent', 'avg_order_value', 'purchase_frequency',
        'total_units', 'days_since_last_purchase'
    ]
    
    # Add derived features
    customer_features['avg_units_per_order'] = (
        customer_features['total_units'] / customer_features['purchase_frequency']
    )
    
    # Standardize features
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(customer_features)
    
    # Determine optimal number of clusters using elbow method
    inertias = []
    k_range = range(2, 11)
    
    for k in k_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(features_scaled)
        inertias.append(kmeans.inertia_)
    
    # Plot elbow curve
    plt.figure(figsize=(10, 6))
    plt.plot(k_range, inertias, marker='o')
    plt.title('Elbow Method for Optimal Number of Clusters')
    plt.xlabel('Number of Clusters')
    plt.ylabel('Inertia')
    plt.grid(True)
    plt.show()
    
    # Apply K-means clustering (using 4 clusters as an example)
    optimal_k = 4
    kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    customer_features['Cluster'] = kmeans.fit_predict(features_scaled)
    
    # Analyze clusters
    cluster_analysis = customer_features.groupby('Cluster').agg({
        'total_spent': ['mean', 'sum', 'count'],
        'avg_order_value': 'mean',
        'purchase_frequency': 'mean',
        'days_since_last_purchase': 'mean',
        'avg_units_per_order': 'mean'
    }).round(2)
    
    # Define cluster profiles
    cluster_profiles = {
        0: "Budget Buyers",
        1: "VIP Customers", 
        2: "Regular Customers",
        3: "At-Risk Customers"
    }
    
    # Visualize clusters using PCA
    pca = PCA(n_components=2)
    features_pca = pca.fit_transform(features_scaled)
    
    plt.figure(figsize=(12, 8))
    colors = ['red', 'blue', 'green', 'orange', 'purple']
    
    for cluster in range(optimal_k):
        cluster_data = features_pca[customer_features['Cluster'] == cluster]
        plt.scatter(cluster_data[:, 0], cluster_data[:, 1], 
                   c=colors[cluster], label=f'Cluster {cluster}', alpha=0.7, s=50)
    
    plt.title('Customer Clusters Visualization (PCA)')
    plt.xlabel(f'First Principal Component (explains {pca.explained_variance_ratio_[0]:.1%} variance)')
    plt.ylabel(f'Second Principal Component (explains {pca.explained_variance_ratio_[1]:.1%} variance)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()
    
    print("🤖 CUSTOMER CLUSTERING ANALYSIS")
    print("=" * 50)
    print(f"Optimal number of clusters: {optimal_k}")
    print(f"Total customers clustered: {len(customer_features):,}")
    print()
    
    print("CLUSTER ANALYSIS:")
    for cluster in range(optimal_k):
        cluster_data = customer_features[customer_features['Cluster'] == cluster]
        profile = cluster_profiles.get(cluster, f"Cluster {cluster}")
        
        print(f"\n🏷️  Cluster {cluster} - {profile}:")
        print(f"   Size: {len(cluster_data)} customers ({len(cluster_data)/len(customer_features)*100:.1f}%)")
        print(f"   Avg Total Spent: ${cluster_data['total_spent'].mean():,.2f}")
        print(f"   Avg Order Value: ${cluster_data['avg_order_value'].mean():.2f}")
        print(f"   Avg Purchase Frequency: {cluster_data['purchase_frequency'].mean():.1f}")
        print(f"   Avg Days Since Last Purchase: {cluster_data['days_since_last_purchase'].mean():.0f}")
    
    return customer_features, cluster_analysis, kmeans

# Run customer clustering
customer_clusters, cluster_stats, clustering_model = customer_clustering_analysis(df)
```

## Reporting & Automation

### Example 9: Automated Report Generation

```python
def generate_automated_report(df, output_path="bikestores_report.xlsx"):
    """
    Generate a comprehensive automated report in Excel format
    """
    
    # Prepare all analyses
    summary_stats = df.describe()
    
    # Customer analysis
    customer_analysis = df.groupby('customers').agg({
        'revenue': ['sum', 'mean', 'count'],
        'total_units': 'sum'
    }).round(2)
    customer_analysis.columns = ['total_revenue', 'avg_order_value', 'order_count', 'total_units']
    
    # Product analysis
    product_analysis = df.groupby('product_name').agg({
        'revenue': 'sum',
        'total_units': 'sum',
        'order_id': 'count'
    }).round(2)
    product_analysis.columns = ['total_revenue', 'units_sold', 'order_frequency']
    
    # Geographic analysis
    geographic_analysis = df.groupby(['state', 'city']).agg({
        'revenue': 'sum',
        'customers': 'nunique',
        'order_id': 'count'
    }).round(2)
    geographic_analysis.columns = ['total_revenue', 'customer_count', 'order_count']
    
    # Sales rep analysis
    sales_rep_analysis = df.groupby('sales_rep').agg({
        'revenue': ['sum', 'mean'],
        'customers': 'nunique',
        'order_id': 'count'
    }).round(2)
    sales_rep_analysis.columns = ['total_sales', 'avg_sale_value', 'customers_served', 'transactions']
    
    # Time series analysis
    df['order_date'] = pd.to_datetime(df['order_date'])
    daily_sales = df.groupby(df['order_date'].dt.date).agg({
        'revenue': 'sum',
        'total_units': 'sum',
        'order_id': 'count'
    }).round(2)
    daily_sales.columns = ['daily_revenue', 'daily_units', 'daily_orders']
    
    # Create Excel report with multiple sheets
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Executive Summary
        summary_data = {
            'Metric': [
                'Total Revenue', 'Total Orders', 'Total Customers', 'Average Order Value',
                'Total Products', 'Total States', 'Total Cities', 'Total Sales Reps'
            ],
            'Value': [
                f"${df['revenue'].sum():,.2f}",
                f"{df['order_id'].nunique():,}",
                f"{df['customers'].nunique():,}",
                f"${df['revenue'].mean():.2f}",
                f"{df['product_name'].nunique():,}",
                f"{df['state'].nunique()}",
                f"{df['city'].nunique()}",
                f"{df['sales_rep'].nunique()}"
            ]
        }
        
        pd.DataFrame(summary_data).to_excel(writer, sheet_name='Executive_Summary', index=False)
        
        # Detailed analyses
        summary_stats.to_excel(writer, sheet_name='Data_Summary')
        customer_analysis.sort_values('total_revenue', ascending=False).to_excel(
            writer, sheet_name='Customer_Analysis'
        )
        product_analysis.sort_values('total_revenue', ascending=False).to_excel(
            writer, sheet_name='Product_Analysis'
        )
        geographic_analysis.sort_values('total_revenue', ascending=False).to_excel(
            writer, sheet_name='Geographic_Analysis'
        )
        sales_rep_analysis.sort_values('total_sales', ascending=False).to_excel(
            writer, sheet_name='Sales_Rep_Analysis'
        )
        daily_sales.to_excel(writer, sheet_name='Daily_Sales_Trends')
    
    print(f"📋 Comprehensive report generated: {output_path}")
    print("📊 Report includes the following sheets:")
    print("   - Executive_Summary")
    print("   - Data_Summary") 
    print("   - Customer_Analysis")
    print("   - Product_Analysis")
    print("   - Geographic_Analysis")
    print("   - Sales_Rep_Analysis")
    print("   - Daily_Sales_Trends")
    
    return output_path

# Generate automated report
report_file = generate_automated_report(df)
```

### Example 10: Scheduled Analysis Pipeline

```python
def create_analysis_pipeline(df):
    """
    Create a comprehensive analysis pipeline that can be scheduled
    """
    import json
    from datetime import datetime
    
    pipeline_results = {}
    pipeline_results['analysis_timestamp'] = datetime.now().isoformat()
    pipeline_results['data_summary'] = {
        'total_records': len(df),
        'date_range': {
            'start': df['order_date'].min().isoformat() if 'order_date' in df.columns else None,
            'end': df['order_date'].max().isoformat() if 'order_date' in df.columns else None
        },
        'total_revenue': float(df['revenue'].sum()),
        'unique_customers': int(df['customers'].nunique()),
        'unique_products': int(df['product_name'].nunique())
    }
    
    # Run all analysis functions
    print("🔄 Running Analysis Pipeline...")
    
    # 1. Multi-dimensional analysis
    print("   ✅ Multi-dimensional revenue analysis")
    multi_results = multi_dimensional_revenue_analysis(df)
    pipeline_results['multi_dimensional_analysis'] = {
        'top_state': multi_results['state_analysis'].index[0],
        'top_state_revenue': float(multi_results['state_analysis']['total_revenue'].iloc[0])
    }
    
    # 2. Customer segmentation
    print("   ✅ Customer segmentation analysis")
    rfm_data, segment_data = customer_segmentation_rfm(df)
    pipeline_results['customer_segmentation'] = {
        'total_customers_segmented': len(rfm_data),
        'segment_distribution': rfm_data['Segment'].value_counts().to_dict()
    }
    
    # 3. Product analysis
    print("   ✅ Advanced product analysis")
    product_results = advanced_product_analysis(df)
    top_product = product_results['product_metrics'].sort_values('total_revenue', ascending=False).index[0]
    pipeline_results['product_analysis'] = {
        'top_product': top_product,
        'top_product_revenue': float(product_results['product_metrics'].loc[top_product, 'total_revenue'])
    }
    
    # 4. Geographic analysis
    print("   ✅ Geographic sales analysis")
    geo_results = geographic_sales_analysis(df)
    pipeline_results['geographic_analysis'] = {
        'states_analyzed': len(geo_results['state_analysis']),
        'cities_analyzed': len(geo_results['city_analysis'])
    }
    
    # 5. Executive dashboard
    print("   ✅ Executive dashboard generation")
    dashboard_results = executive_dashboard(df)
    pipeline_results['executive_metrics'] = dashboard_results['kpis']
    
    # 6. Generate reports
    print("   ✅ Report generation")
    report_file = generate_automated_report(df, f"bikestores_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
    pipeline_results['report_file'] = report_file
    
    # Save pipeline results as JSON
    results_file = f"pipeline_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump(pipeline_results, f, indent=2, default=str)
    
    print("   ✅ Pipeline results saved")
    print(f"\n🎉 Analysis pipeline completed successfully!")
    print(f"📄 Results summary saved to: {results_file}")
    print(f"📊 Detailed report saved to: {report_file}")
    
    return pipeline_results, results_file

# Run the complete analysis pipeline
pipeline_output, results_file = create_analysis_pipeline(df)
```

---

## Usage Notes

1. **Prerequisites**: Install required packages: `pip install pandas openpyxl xlrd matplotlib seaborn plotly scikit-learn`

2. **Data Loading**: Ensure the BikeStores Excel file is in the same directory as your script

3. **Customization**: All examples can be modified to focus on specific aspects of your analysis

4. **Performance**: For large datasets, consider using data sampling or chunking for visualization functions

5. **Automation**: The pipeline functions can be integrated with scheduling tools like cron or Windows Task Scheduler

6. **Extensions**: These examples provide a foundation that can be extended with additional machine learning models, advanced statistical analysis, or integration with business intelligence tools

---

*These examples demonstrate the comprehensive analytical capabilities available with the BikeStores dataset. Each example builds upon the core API functions and can be combined or extended based on specific business requirements.*