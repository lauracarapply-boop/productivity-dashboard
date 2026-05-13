'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, Plus, X, Check,
  Search, ArrowUpRight, ArrowDownLeft, PiggyBank,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FinanceTab = 'overview' | 'transactions' | 'budget' | 'goals'
type TxType = 'income' | 'expense'

interface Transaction {
  id: string
  type: TxType
  amount: number
  category: string
  description: string
  date: Date
  icon: string
}

interface BudgetCategory {
  name: string
  budgeted: number
  spent: number
  color: string
  icon: string
}

interface SavingsGoal {
  id: string
  name: string
  target: number
  saved: number
  deadline: string
  icon: string
  color: string
}

function d(y: number, m: number, day: number) { return new Date(y, m - 1, day) }

const INIT_TRANSACTIONS: Transaction[] = []

const BUDGET_CATEGORIES: BudgetCategory[] = [
  { name: 'Housing',      budgeted: 800, spent: 0, color: '#3F5F5A', icon: '🏠' },
  { name: 'Groceries',    budgeted: 200, spent: 0, color: '#10B981', icon: '🛒' },
  { name: 'Food & Dining',budgeted: 150, spent: 0, color: '#F59E0B', icon: '🍽️' },
  { name: 'Transport',    budgeted: 100, spent: 0, color: '#0EA5E9', icon: '🚗' },
  { name: 'Books',        budgeted: 100, spent: 0, color: '#8B5CF6', icon: '📚' },
  { name: 'Subscriptions',budgeted: 50,  spent: 0, color: '#EC4899', icon: '📱' },
  { name: 'Health',       budgeted: 80,  spent: 0, color: '#EF4444', icon: '💊' },
  { name: 'Entertainment',budgeted: 80,  spent: 0, color: '#14B8A6', icon: '🎬' },
]

const INIT_GOALS: SavingsGoal[] = []

const EXPENSE_CATS = ['Housing','Groceries','Food & Dining','Transport','Books','Subscriptions','Health','Entertainment','Shopping','Other']
const INCOME_CATS  = ['Salary','Freelance','Part-time','Gift','Refund','Other']

function fmt(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function FinancesPage() {
  const [activeTab, setActiveTab]     = useState<FinanceTab>('overview')
  const [transactions, setTransactions] = useState(INIT_TRANSACTIONS)
  const [goals, setGoals]             = useState(INIT_GOALS)
  const [showForm, setShowForm]       = useState(false)
  const [addSuccess, setAddSuccess]   = useState(false)
  const [txFilter, setTxFilter]       = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch]           = useState('')
  const [addingGoalId, setAddingGoalId] = useState<string | null>(null)
  const [addAmount, setAddAmount]     = useState('')

  const [newTx, setNewTx] = useState<{
    type: TxType; amount: string; category: string; description: string; date: string
  }>({ type: 'expense', amount: '', category: 'Food & Dining', description: '', date: new Date().toISOString().split('T')[0] })

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const balance       = totalIncome - totalExpenses
  const savingsRate   = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

  const filteredTx = useMemo(() =>
    transactions
      .filter(t => txFilter === 'all' || t.type === txFilter)
      .filter(t => !search || t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [transactions, txFilter, search],
  )

  function handleAddTx(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(newTx.amount)
    if (isNaN(amount) || amount <= 0 || !newTx.description) return
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: newTx.type,
      amount,
      category: newTx.category,
      description: newTx.description,
      date: new Date(newTx.date + 'T12:00:00'),
      icon: newTx.type === 'income' ? '💰' : '💸',
    }, ...prev])
    setAddSuccess(true)
    setTimeout(() => {
      setShowForm(false)
      setAddSuccess(false)
      setNewTx({ type: 'expense', amount: '', category: 'Food & Dining', description: '', date: new Date().toISOString().split('T')[0] })
    }, 1500)
  }

  function handleAddToGoal(goalId: string) {
    const amt = parseFloat(addAmount)
    if (!isNaN(amt) && amt > 0) {
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amt) } : g))
    }
    setAddingGoalId(null)
    setAddAmount('')
  }

  const TABS = [
    { id: 'overview'     as FinanceTab, label: 'Overview' },
    { id: 'transactions' as FinanceTab, label: 'Transactions' },
    { id: 'budget'       as FinanceTab, label: 'Budget' },
    { id: 'goals'        as FinanceTab, label: 'Goals' },
  ]

  const totalBudgeted  = BUDGET_CATEGORIES.reduce((a, c) => a + c.budgeted, 0)
  const totalSpent     = BUDGET_CATEGORIES.reduce((a, c) => a + c.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent

  return (
    <div className="flex-1 bg-[#F5F4F1] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.07] px-8 py-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Finances</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track income, expenses, and savings goals</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
            style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}
          >
            <Plus size={14} /> Add Transaction
          </button>
        </div>
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Current Balance',  value: fmt(balance),           icon: DollarSign,    color: balance >= 0 ? '#10B981' : '#EF4444', bg: balance >= 0 ? '#D1FAE5' : '#FEE2E2', sub: 'This month' },
                { label: 'Total Income',     value: fmt(totalIncome),       icon: ArrowUpRight,   color: '#10B981', bg: '#D1FAE5', sub: 'May 2026' },
                { label: 'Total Expenses',   value: fmt(totalExpenses),     icon: ArrowDownLeft,  color: '#EF4444', bg: '#FEE2E2', sub: 'May 2026' },
                { label: 'Savings Rate',     value: `${savingsRate.toFixed(0)}%`, icon: TrendingUp, color: '#3F5F5A', bg: '#EAF4F2', sub: 'of income saved' },
              ].map(stat => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white rounded-2xl border border-black/[0.07] p-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
                      <Icon size={17} style={{ color: stat.color }} />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</div>
                    <div className="text-xs font-medium text-slate-600 mt-1">{stat.label}</div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Spending by category */}
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Spending by Category</h3>
                <div className="space-y-3">
                  {BUDGET_CATEGORIES.filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent).map(cat => {
                    const pct = Math.min(100, (cat.spent / cat.budgeted) * 100)
                    const over = cat.spent > cat.budgeted
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{cat.icon}</span>
                            <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                          </div>
                          <div className="text-xs">
                            <span className={cn('font-semibold', over ? 'text-red-500' : 'text-slate-800')}>{fmt(cat.spent)}</span>
                            <span className="text-slate-400"> / {fmt(cat.budgeted)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? '#EF4444' : cat.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent transactions */}
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs text-indigo-600 font-medium hover:underline">View all</button>
                </div>
                <div className="space-y-1">
                  {transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8).map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-black/[0.05] last:border-0">
                      <span className="text-base flex-shrink-0">{tx.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.category} · {fmtDate(tx.date)}</p>
                      </div>
                      <span className={cn('text-sm font-semibold', tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700')}>
                        {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings goals snapshot */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Savings Goals</h3>
                <button onClick={() => setActiveTab('goals')} className="text-xs text-indigo-600 font-medium hover:underline">Manage goals</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {goals.map(goal => {
                  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100))
                  return (
                    <div key={goal.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{goal.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{goal.name}</p>
                          <p className="text-[10px] text-slate-400">By {goal.deadline}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">{fmt(goal.saved)}</span>
                        <span className="text-slate-400">{fmt(goal.target)}</span>
                      </div>
                      <div className="h-2 bg-white rounded-full overflow-hidden border border-black/[0.07]">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: goal.color }} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{pct}% reached</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>
              {(['all', 'income', 'expense'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize',
                    txFilter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-black/[0.12] text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-black/[0.07] divide-y divide-black/[0.05]">
              {filteredTx.map(tx => (
                <div key={tx.id} className="flex items-center gap-4 p-4">
                  <span className="text-xl flex-shrink-0">{tx.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                    <p className="text-xs text-slate-400">{tx.category} · {fmtDate(tx.date)}</p>
                  </div>
                  <span className={cn('text-base font-bold', tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700')}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
                  </span>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600')}>
                    {tx.type}
                  </span>
                </div>
              ))}
              {filteredTx.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No transactions found</div>
              )}
            </div>
          </div>
        )}

        {/* ── BUDGET ── */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Budgeted', value: fmt(totalBudgeted), color: 'text-slate-800' },
                { label: 'Total Spent',    value: fmt(totalSpent),    color: 'text-slate-800' },
                { label: 'Remaining',      value: fmt(Math.abs(totalRemaining)), color: totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-500' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-black/[0.07] p-5 text-center">
                  <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {BUDGET_CATEGORIES.map(cat => {
                const pct      = Math.min(100, (cat.spent / cat.budgeted) * 100)
                const remaining = cat.budgeted - cat.spent
                const over     = remaining < 0
                return (
                  <div key={cat.name} className="bg-white rounded-2xl border border-black/[0.07] p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">{cat.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                          <div className="text-sm">
                            <span className={cn('font-bold', over ? 'text-red-500' : 'text-slate-800')}>{fmt(cat.spent)}</span>
                            <span className="text-slate-400 text-xs"> / {fmt(cat.budgeted)}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? '#EF4444' : cat.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{pct.toFixed(0)}% of budget used</span>
                      <span className={cn('font-semibold', over ? 'text-red-500' : 'text-emerald-600')}>
                        {over ? `${fmt(-remaining)} over budget` : `${fmt(remaining)} remaining`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── GOALS ── */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            {goals.map(goal => {
              const pct       = Math.min(100, Math.round((goal.saved / goal.target) * 100))
              const remaining = goal.target - goal.saved
              const isAdding  = addingGoalId === goal.id
              return (
                <div key={goal.id} className="bg-white rounded-2xl border border-black/[0.07] p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${goal.color}18` }}>
                      {goal.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-slate-800">{goal.name}</h3>
                      <p className="text-xs text-slate-400">Target: {goal.deadline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800">{pct}%</div>
                      <div className="text-xs text-slate-400">of goal</div>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: goal.color }} />
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div>
                      <span className="font-bold text-slate-800">{fmt(goal.saved)}</span>
                      <span className="text-slate-400"> saved of {fmt(goal.target)}</span>
                    </div>
                    <span className="text-slate-500">{fmt(remaining)} to go</span>
                  </div>
                  {isAdding ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={addAmount}
                          onChange={e => setAddAmount(e.target.value)}
                          placeholder="Amount to add"
                          autoFocus
                          className="w-full pl-7 pr-4 py-2 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <button onClick={() => handleAddToGoal(goal.id)} className="px-4 py-2 text-xs font-semibold text-white rounded-xl" style={{ background: goal.color }}>
                        Save
                      </button>
                      <button onClick={() => { setAddingGoalId(null); setAddAmount('') }} className="px-3 py-2 text-xs font-medium text-slate-500 border border-black/[0.12] rounded-xl hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingGoalId(goal.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg"
                      style={{ background: goal.color }}
                    >
                      <Plus size={12} /> Add Savings
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-800">Add Transaction</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={14} className="text-slate-500" /></button>
            </div>
            {addSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center"><Check size={22} className="text-emerald-600" /></div>
                <p className="text-sm font-medium text-slate-700">Transaction added!</p>
              </div>
            ) : (
              <form onSubmit={handleAddTx} className="space-y-4">
                {/* Type toggle */}
                <div className="flex rounded-xl border border-black/[0.12] overflow-hidden">
                  <button type="button" onClick={() => setNewTx(p => ({ ...p, type: 'expense', category: 'Food & Dining' }))}
                    className={cn('flex-1 py-2.5 text-sm font-semibold transition-all', newTx.type === 'expense' ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-50')}>
                    − Expense
                  </button>
                  <button type="button" onClick={() => setNewTx(p => ({ ...p, type: 'income', category: 'Salary' }))}
                    className={cn('flex-1 py-2.5 text-sm font-semibold transition-all', newTx.type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50')}>
                    + Income
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                    <input type="number" min="0.01" step="0.01" value={newTx.amount} onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0.00" required
                      className="w-full pl-7 pr-4 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
                  <select value={newTx.category} onChange={e => setNewTx(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {(newTx.type === 'expense' ? EXPENSE_CATS : INCOME_CATS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
                  <input type="text" value={newTx.description} onChange={e => setNewTx(p => ({ ...p, description: e.target.value }))}
                    placeholder="What was it for?" required
                    className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                  <input type="date" value={newTx.date} onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))} required
                    className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-black/[0.12] rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-white text-sm font-semibold rounded-xl" style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}>Add</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
