# 💰 FlowFi - Smart Expense Tracking

> **Every Rupee, In Control**

FlowFi is a modern, intelligent expense tracking application designed to help you take complete control of your personal finances. Built with cutting-edge web technologies, it offers powerful features while maintaining an intuitive, user-friendly interface.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## ✨ Features

### 📊 Core Functionality
- **Smart Expense Tracking** - Log expenses quickly with intelligent categorization
- **Budget Management** - Set and track budgets with real-time alerts
- **Category Management** - Customize categories with emojis and colors
- **Recurring Expenses** - Automate tracking for subscriptions and regular payments
- **Multi-Currency Support** - Track expenses in multiple currencies seamlessly

### 🧠 Intelligence & Analytics
- **Advanced Analytics** - AI-powered insights and spending pattern analysis
- **Predictive Forecasting** - Anticipate future expenses based on historical data
- **Smart Insights** - Get actionable recommendations to optimize spending
- **Trend Analysis** - Visualize spending patterns over time
- **Budget Alerts** - Receive notifications when approaching budget limits

### 🎯 User Experience
- **Voice Entry** - Quick expense logging through voice commands
- **Search & Filter** - Powerful search with multiple filter options
- **Undo/Redo** - Full history management for peace of mind
- **Dark Mode** - Eye-friendly interface for day and night use
- **Responsive Design** - Seamless experience across all devices
- **Offline-First** - Works without internet connection

### 📤 Data Management
- **Export Options** - Export to CSV, Excel, PDF, or JSON
- **Import Data** - Import expenses from CSV files
- **Google Drive Backup** - Cloud backup and restore functionality
- **Data Privacy** - All data stored locally in your browser
- **Clear Data** - Complete data management control

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flowfi.git
   cd flowfi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework

### State Management
- **React Context API** - Centralized state management
- **Custom Hooks** - Reusable logic components

### Data & Storage
- **IndexedDB** - Client-side database for offline support
- **LocalStorage** - Persistent settings and preferences

### Libraries & Tools
- **date-fns** - Modern date utility library
- **Lucide React** - Beautiful icon set
- **jsPDF** - PDF generation
- **XLSX** - Excel file handling
- **Recharts** - Data visualization

## 📁 Project Structure

```
flowfi/
├── src/
│   ├── components/        # React components
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   ├── BudgetManager.tsx
│   │   ├── CategoryManager.tsx
│   │   └── ...
│   ├── context/          # React Context providers
│   │   ├── ExpenseContext.tsx
│   │   └── CurrencyContext.tsx
│   ├── lib/              # Utility functions
│   │   ├── storage.ts    # IndexedDB operations
│   │   ├── utils.ts      # Helper functions
│   │   ├── insights.ts   # Analytics engine
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── package.json
```

## 🎨 Key Features Explained

### Budget Management
Set monthly budgets for different categories and get real-time alerts when you're approaching or exceeding limits. The intelligent budget system helps you stay on track with your financial goals.

### Advanced Analytics
FlowFi's analytics engine provides:
- **Spending Patterns** - Identify where your money goes
- **Category Breakdown** - Visual representation of expenses
- **Time-based Trends** - Track changes over weeks and months
- **Predictive Insights** - Forecast future spending

### Voice Entry
Simply speak your expense details, and FlowFi will automatically parse and categorize them. Perfect for quick logging on the go.

### Recurring Expenses
Set up recurring expenses once, and FlowFi will automatically track them. Never forget about subscriptions or regular payments again.

## 🔒 Privacy & Security

- **Local-First** - All data is stored locally in your browser
- **No Server** - No data is sent to external servers
- **Export Control** - You own your data and can export it anytime
- **Optional Cloud Backup** - Google Drive integration is opt-in

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern fintech applications
- Built with ❤️ using React and TypeScript

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

**Made with 💙 by [Your Name]**

*FlowFi - Take control of your finances, one expense at a time.*
