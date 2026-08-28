import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { products } from '../data/products';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

export function Growth() {
  // Generate unique mock data for each product's growth
  const growthData = useMemo(() => {
    return products.map((product, index) => {
      let currentIncome = 0;
      
      const data = MONTHS.map((month, i) => {
        // Start all graphs at 0 for the first month
        if (i === 0) {
          return { time: month, income: 0 };
        }
        
        // Add an upward bias in early months to reach the 1000-3000 range, 
        // but allow for fluctuations (increases and decreases)
        const upwardBias = i < 3 ? 800 : 0;
        const change = (Math.random() - 0.45) * 1000 + upwardBias; 
        
        // Ensure income never drops below 0
        currentIncome = Math.max(0, Math.min(4000, currentIncome + change));
        
        return {
          time: month,
          // Round to nice numbers
          income: Math.round(currentIncome / 100) * 100
        };
      });

      return {
        product,
        data
      };
    });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Growth</h2>
        <p className="text-sm text-muted-foreground">Income over time per course</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {growthData.map(({ product, data }) => (
          <div key={product.id} className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-sm line-clamp-2 leading-snug" title={product.name}>
                {product.name}
              </h3>
            </div>
            
            <div className="h-[220px] w-full mt-2 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={data} 
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }} 
                  accessibilityLayer={false}
                  width={300}
                  height={220}
                  key={`lc-${product.id}`}
                  id={`chart-${product.id}`}
                >
                  <CartesianGrid 
                    key={`cg-${product.id}`}
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke="hsl(var(--border))" 
                    opacity={0.5} 
                  />
                  <XAxis 
                    key={`xa-${product.id}`}
                    dataKey="time" 
                    axisLine={{ stroke: '#22D3EE' }} 
                    tickLine={{ stroke: '#22D3EE' }} 
                    tick={{ fontSize: 12, fill: '#22D3EE', fontWeight: 500 }} 
                    dy={10}
                    label={{ value: 'Time', position: 'insideBottom', offset: -15, fill: '#22D3EE', fontSize: 12, fontWeight: 600 }}
                    id={`x-${product.id}`}
                  />
                  <YAxis 
                    key={`ya-${product.id}`}
                    axisLine={{ stroke: '#22D3EE' }} 
                    tickLine={{ stroke: '#22D3EE' }} 
                    tick={{ fontSize: 12, fill: '#22D3EE', fontWeight: 500 }}
                    tickFormatter={(value) => value}
                    domain={[0, 'auto']}
                    width={70}
                    label={{ value: 'Income - RM', angle: -90, position: 'insideLeft', offset: 0, fill: '#22D3EE', fontSize: 12, fontWeight: 600, style: { textAnchor: 'middle' } }}
                    allowDecimals={false}
                    id={`y-${product.id}`}
                  />
                  <Tooltip 
                    key={`tt-${product.id}`}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    formatter={(value: number) => [`RM ${value}`, 'Income']}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '4px' }}
                    itemStyle={{ color: '#22D3EE', fontWeight: 600 }}
                    isAnimationActive={false}
                  />
                  <Line 
                    key={`ln-${product.id}`}
                    type="monotone" 
                    dataKey="income" 
                    stroke="#22D3EE" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#22D3EE', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
