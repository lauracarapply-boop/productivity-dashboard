'use client'

import { useState } from 'react'
import {
  Heart, Calendar, Dumbbell, Apple, Plus, Bell, X, Check,
  User, Droplets, Flame, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type HealthTab = 'overview' | 'doctors' | 'workout' | 'nutrition'

interface Doctor {
  id: string
  name: string
  specialty: string
  phone: string
  lastVisit: Date | null
  intervalMonths: number
  color: string
}

interface Appointment {
  id: string
  doctorName: string
  specialty: string
  date: Date
  time: string
  type: string
  notes: string
  upcoming: boolean
}

interface Exercise {
  name: string
  sets: number
  reps: string
  weight?: string
}

interface WorkoutDay {
  day: string
  short: string
  name: string
  exercises: Exercise[]
  isRest: boolean
  completed: boolean
}

interface FoodItem {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  id: string
  name: string
  time: string
  items: FoodItem[]
}

const TODAY = new Date()

function monthsAgo(n: number): Date {
  const d = new Date(TODAY)
  d.setMonth(d.getMonth() - n)
  return d
}

function daysFromNow(n: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + n)
  return d
}

function monthsSince(date: Date): number {
  return (
    (TODAY.getFullYear() - date.getFullYear()) * 12 +
    (TODAY.getMonth() - date.getMonth())
  )
}

function isOverdue(doc: Doctor): boolean {
  if (!doc.lastVisit) return true
  return monthsSince(doc.lastVisit) >= doc.intervalMonths
}

function fmtDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DOCTORS: Doctor[] = []

const INIT_APPOINTMENTS: Appointment[] = []

const TODAY_DOW = TODAY.getDay() // 0=Sun

const WORKOUT_WEEK: WorkoutDay[] = []

const NUTRITION_GOALS = { calories: 2000, protein: 120, carbs: 200, fat: 65, water: 8 }

const INIT_MEALS: Meal[] = []

const APPT_TYPES = ['Check-up', 'Annual Physical', 'Follow-up', 'Cleaning', 'Consultation', 'Vaccination', 'Exam', 'Other']

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState<HealthTab>('overview')
  const [appointments, setAppointments] = useState(INIT_APPOINTMENTS)
  const [workoutDays, setWorkoutDays] = useState(WORKOUT_WEEK)
  const [meals] = useState(INIT_MEALS)
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)
  const [showAddAppt, setShowAddAppt] = useState(false)
  const [apptSuccess, setApptSuccess] = useState(false)
  const [newAppt, setNewAppt] = useState({ doctorId: '', customName: '', customSpec: '', date: '', time: '', type: 'Check-up', notes: '' })

  const overdueCount = DOCTORS.filter(isOverdue).length
  const upcomingAppts = appointments.filter(a => a.upcoming).sort((a, b) => a.date.getTime() - b.date.getTime())
  const completedWorkouts = workoutDays.filter(d => !d.isRest && d.completed).length
  const totalWorkouts   = workoutDays.filter(d => !d.isRest).length

  const totalNutrition = meals.reduce(
    (acc, meal) => {
      meal.items.forEach(i => { acc.calories += i.calories; acc.protein += i.protein; acc.carbs += i.carbs; acc.fat += i.fat })
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  function handleAddAppt(e: React.FormEvent) {
    e.preventDefault()
    const doc = DOCTORS.find(d => d.id === newAppt.doctorId)
    const name = doc ? doc.name : newAppt.customName
    const spec = doc ? doc.specialty : newAppt.customSpec
    if (!name || !newAppt.date || !newAppt.time) return

    setAppointments(prev => [...prev, {
      id: Date.now().toString(),
      doctorName: name,
      specialty: spec,
      date: new Date(newAppt.date + 'T12:00:00'),
      time: newAppt.time,
      type: newAppt.type,
      notes: newAppt.notes,
      upcoming: true,
    }])
    setApptSuccess(true)
    setTimeout(() => { setShowAddAppt(false); setApptSuccess(false); setNewAppt({ doctorId: '', customName: '', customSpec: '', date: '', time: '', type: 'Check-up', notes: '' }) }, 1500)
  }

  function toggleDay(index: number) {
    setWorkoutDays(prev => prev.map((d, i) => i === index ? { ...d, completed: !d.completed } : d))
    setSelectedDay(prev => prev ? { ...prev, completed: !prev.completed } : null)
  }

  const todayDowIndex = TODAY_DOW === 0 ? 6 : TODAY_DOW - 1

  const TABS = [
    { id: 'overview'   as HealthTab, label: 'Overview',   icon: Heart },
    { id: 'doctors'    as HealthTab, label: 'Doctors',    icon: User },
    { id: 'workout'    as HealthTab, label: 'Workout',    icon: Dumbbell },
    { id: 'nutrition'  as HealthTab, label: 'Nutrition',  icon: Apple },
  ]

  return (
    <div className="flex-1 bg-[#F5F4F1] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.07] px-8 py-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">Health & Wellness</h1>
            <p className="text-sm text-slate-500 mt-0.5">Appointments, workouts, and nutrition</p>
          </div>
          <div className="flex items-center gap-2.5">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                <Bell size={13} />
                {overdueCount} doctor{overdueCount > 1 ? 's' : ''} overdue
              </div>
            )}
            <button
              onClick={() => setShowAddAppt(true)}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}
            >
              <Plus size={14} /> Add Appointment
            </button>
          </div>
        </div>
        <div className="flex gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                )}
              >
                <Icon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-8">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Overdue alert */}
            {overdueCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={14} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Overdue check-ups</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DOCTORS.filter(isOverdue).map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-xs font-medium text-slate-700">{doc.name}</span>
                      <span className="text-xs text-slate-400">· {doc.specialty}</span>
                      <span className="text-xs text-red-500 font-semibold">{monthsSince(doc.lastVisit!)} mo ago</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Upcoming Appointments', value: upcomingAppts.length, sub: 'next 30 days',     icon: Calendar, color: '#3F5F5A', bg: '#EAF4F2' },
                { label: 'Workout Streak',         value: '4 days',             sub: 'keep it up!',       icon: Flame,    color: '#F59E0B', bg: '#FEF3C7' },
                { label: 'Sessions This Week',     value: `${completedWorkouts}/${totalWorkouts}`, sub: 'completed', icon: Activity,  color: '#10B981', bg: '#D1FAE5' },
                { label: "Today's Calories",       value: totalNutrition.calories, sub: `of ${NUTRITION_GOALS.calories} kcal goal`, icon: Apple, color: '#EC4899', bg: '#FCE7F3' },
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
              {/* Upcoming appointments */}
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Upcoming Appointments</h3>
                  <button onClick={() => setActiveTab('doctors')} className="text-xs text-indigo-600 font-medium hover:underline">View all</button>
                </div>
                {upcomingAppts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppts.map(appt => {
                      const daysLeft = Math.round((appt.date.getTime() - TODAY.getTime()) / 86400000)
                      return (
                        <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-indigo-600 leading-none">{appt.date.toLocaleString('en-US', { month: 'short' })}</span>
                            <span className="text-base font-bold text-indigo-700 leading-tight">{appt.date.getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{appt.doctorName}</p>
                            <p className="text-xs text-slate-500">{appt.specialty} · {appt.time}</p>
                          </div>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600')}>
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Workout week mini */}
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">This Week's Workout</h3>
                  <button onClick={() => setActiveTab('workout')} className="text-xs text-indigo-600 font-medium hover:underline">Full plan</button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {workoutDays.map((day, i) => (
                    <div key={day.day} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium text-slate-400">{day.short}</span>
                      <div className={cn(
                        'w-full aspect-square rounded-lg flex items-center justify-center',
                        day.isRest ? 'bg-slate-100 text-slate-300'
                          : day.completed ? 'bg-emerald-500 text-white'
                          : i === todayDowIndex ? 'bg-indigo-100 ring-2 ring-indigo-300'
                          : 'bg-slate-100',
                      )}>
                        {day.isRest ? <span className="text-xs">—</span>
                          : day.completed ? <Check size={12} />
                          : <Dumbbell size={10} className={i === todayDowIndex ? 'text-indigo-500' : 'text-slate-400'} />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-black/[0.06]">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Weekly progress</span>
                    <span className="font-semibold text-slate-700">{completedWorkouts}/{totalWorkouts} sessions</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(completedWorkouts / totalWorkouts) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition summary */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Today's Nutrition</h3>
                <button onClick={() => setActiveTab('nutrition')} className="text-xs text-indigo-600 font-medium hover:underline">Full log</button>
              </div>
              <div className="grid grid-cols-4 gap-6 mb-4">
                {[
                  { label: 'Calories', current: totalNutrition.calories, goal: NUTRITION_GOALS.calories, unit: 'kcal', color: '#F59E0B' },
                  { label: 'Protein',  current: totalNutrition.protein,  goal: NUTRITION_GOALS.protein,  unit: 'g',    color: '#3F5F5A' },
                  { label: 'Carbs',    current: totalNutrition.carbs,    goal: NUTRITION_GOALS.carbs,    unit: 'g',    color: '#10B981' },
                  { label: 'Fat',      current: totalNutrition.fat,      goal: NUTRITION_GOALS.fat,      unit: 'g',    color: '#EC4899' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600">{m.label}</span>
                      <span className="text-slate-400">{m.current}/{m.goal}{m.unit}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (m.current / m.goal) * 100)}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-black/[0.06]">
                <Droplets size={13} className="text-blue-400" />
                <span className="text-xs text-slate-500">Water:</span>
                <div className="flex gap-1">
                  {Array.from({ length: NUTRITION_GOALS.water }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)}
                      className={cn('w-5 h-5 rounded-md transition-all', i < waterGlasses ? 'bg-blue-400' : 'bg-slate-200 hover:bg-slate-300')}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 ml-1">{waterGlasses}/{NUTRITION_GOALS.water} glasses</span>
              </div>
            </div>
          </div>
        )}

        {/* ── DOCTORS ── */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            {DOCTORS.map(doc => {
              const overdue = isOverdue(doc)
              const months = doc.lastVisit ? monthsSince(doc.lastVisit) : null
              const nextAppt = appointments.find(a => a.upcoming && a.doctorName === doc.name)
              return (
                <div key={doc.id} className={cn('bg-white rounded-2xl border p-5', overdue ? 'border-red-200' : 'border-black/[0.07]')}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${doc.color}, ${doc.color}99)` }}>
                      {doc.name.split(' ').pop()![0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-800">{doc.name}</h3>
                          <p className="text-sm text-slate-500">{doc.specialty}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{doc.phone}</p>
                        </div>
                        {overdue ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-red-100 text-red-600 rounded-full">
                            <Bell size={10} /> Overdue — schedule now
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-600 rounded-full">
                            <Check size={10} /> Up to date
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-6 mt-3 pt-3 border-t border-black/[0.06] text-xs text-slate-500">
                        <div>
                          <span className="text-slate-400">Last visit: </span>
                          <span className={cn('font-medium', overdue ? 'text-red-500' : 'text-slate-700')}>
                            {doc.lastVisit ? `${months} months ago (${fmtDate(doc.lastVisit)})` : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Recommended: </span>
                          <span className="font-medium text-slate-700">every {doc.intervalMonths} months</span>
                        </div>
                        {nextAppt && (
                          <div>
                            <span className="text-slate-400">Next: </span>
                            <span className="font-medium text-indigo-600">{fmtShort(nextAppt.date)} at {nextAppt.time}</span>
                          </div>
                        )}
                        {overdue && (
                          <button
                            onClick={() => { setNewAppt(p => ({ ...p, doctorId: doc.id })); setShowAddAppt(true) }}
                            className="ml-auto text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            + Schedule
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Appointments log */}
            <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">All Appointments</h3>
                <button onClick={() => setShowAddAppt(true)} className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
                  <Plus size={11} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {appointments.sort((a, b) => b.date.getTime() - a.date.getTime()).map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', appt.upcoming ? 'bg-indigo-500' : 'bg-slate-300')} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-800">{appt.doctorName}</span>
                      <span className="text-sm text-slate-500"> · {appt.type}</span>
                    </div>
                    <span className="text-xs text-slate-500">{fmtDate(appt.date)}</span>
                    <span className="text-xs text-slate-500">{appt.time}</span>
                    {appt.upcoming && <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">Upcoming</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WORKOUT ── */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Weekly Plan</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Flame size={12} className="text-amber-500" />
                  4-day streak
                </div>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {workoutDays.map((day, i) => {
                  const isToday = i === todayDowIndex
                  const isSelected = selectedDay?.day === day.day
                  return (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                        isSelected ? 'border-indigo-300 bg-indigo-50'
                          : isToday ? 'border-indigo-200 bg-indigo-50/50'
                          : 'border-black/[0.07] bg-slate-50 hover:bg-slate-100',
                      )}
                    >
                      <span className={cn('text-[11px] font-bold', isToday ? 'text-indigo-600' : 'text-slate-500')}>{day.short}</span>
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        day.isRest ? 'bg-slate-200'
                          : day.completed ? 'bg-emerald-500'
                          : isToday ? 'bg-indigo-200'
                          : 'bg-slate-200',
                      )}>
                        {day.isRest ? <span className="text-slate-400 text-xs">R</span>
                          : day.completed ? <Check size={14} className="text-white" />
                          : <Dumbbell size={12} className={isToday ? 'text-indigo-600' : 'text-slate-400'} />}
                      </div>
                      <span className="text-[10px] text-slate-500 text-center leading-tight">{day.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedDay && !selectedDay.isRest && (
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">{selectedDay.day} — {selectedDay.name}</h3>
                  <button
                    onClick={() => { const idx = workoutDays.findIndex(d => d.day === selectedDay.day); toggleDay(idx) }}
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
                      selectedDay.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700',
                    )}
                  >
                    <Check size={12} />
                    {selectedDay.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedDay.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-indigo-600">{i + 1}</span>
                      </div>
                      <span className="flex-1 text-sm font-medium text-slate-800">{ex.name}</span>
                      <span className="text-xs text-slate-500">{ex.sets} × {ex.reps}</span>
                      {ex.weight && <span className="text-xs font-semibold text-slate-700">{ex.weight}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDay?.isRest && (
              <div className="bg-white rounded-2xl border border-black/[0.07] p-10 text-center">
                <div className="text-4xl mb-3">😴</div>
                <h3 className="text-base font-semibold text-slate-700">Rest Day</h3>
                <p className="text-sm text-slate-400 mt-1">Recovery is part of training. Enjoy it.</p>
              </div>
            )}

            {!selectedDay && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-sm text-slate-400">Select a day above to see the workout details</p>
              </div>
            )}
          </div>
        )}

        {/* ── NUTRITION ── */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Calories',      current: totalNutrition.calories, goal: NUTRITION_GOALS.calories, unit: 'kcal', color: '#F59E0B' },
                { label: 'Protein',       current: totalNutrition.protein,  goal: NUTRITION_GOALS.protein,  unit: 'g',    color: '#3F5F5A' },
                { label: 'Carbohydrates', current: totalNutrition.carbs,    goal: NUTRITION_GOALS.carbs,    unit: 'g',    color: '#10B981' },
                { label: 'Fat',           current: totalNutrition.fat,      goal: NUTRITION_GOALS.fat,      unit: 'g',    color: '#EC4899' },
              ].map(m => {
                const pct = Math.min(100, Math.round((m.current / m.goal) * 100))
                return (
                  <div key={m.label} className="bg-white rounded-2xl border border-black/[0.07] p-5">
                    <div className="text-xs font-medium text-slate-500 mb-2">{m.label}</div>
                    <div className="text-2xl font-bold text-slate-800">{m.current}<span className="text-sm font-normal text-slate-400 ml-1">{m.unit}</span></div>
                    <div className="text-xs text-slate-400 mb-2">of {m.goal}{m.unit}</div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{pct}% of goal</div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Today's Meals</h3>
                {meals.map(meal => {
                  const totals = meal.items.reduce((a, i) => ({ cal: a.cal + i.calories, prot: a.prot + i.protein }), { cal: 0, prot: 0 })
                  return (
                    <div key={meal.id} className="bg-white rounded-2xl border border-black/[0.07] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-sm font-semibold text-slate-800">{meal.name}</span>
                          <span className="text-xs text-slate-400 ml-2">{meal.time}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{totals.cal} kcal · {totals.prot}g protein</span>
                      </div>
                      <div className="space-y-1">
                        {meal.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-black/[0.04] last:border-0">
                            <span className="text-xs text-slate-700">{item.name}</span>
                            <span className="text-xs text-slate-400">{item.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Water tracker */}
              <div className="bg-white rounded-2xl border border-black/[0.07] p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Water Intake</h3>
                <p className="text-xs text-slate-400 mb-4">Goal: {NUTRITION_GOALS.water} glasses / day</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Array.from({ length: NUTRITION_GOALS.water }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all',
                        i < waterGlasses ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100',
                      )}
                    >
                      <Droplets size={16} className={i < waterGlasses ? 'text-blue-500' : 'text-slate-300'} />
                      <span className="text-[10px] font-medium text-slate-500">{i + 1}</span>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800">{waterGlasses}</div>
                  <div className="text-xs text-slate-400">of {NUTRITION_GOALS.water} glasses</div>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${(waterGlasses / NUTRITION_GOALS.water) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showAddAppt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-800">Add Appointment</h2>
              <button onClick={() => setShowAddAppt(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={14} className="text-slate-500" /></button>
            </div>
            {apptSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center"><Check size={22} className="text-emerald-600" /></div>
                <p className="text-sm font-medium text-slate-700">Appointment added!</p>
              </div>
            ) : (
              <form onSubmit={handleAddAppt} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Doctor</label>
                  <select
                    value={newAppt.doctorId}
                    onChange={e => setNewAppt(p => ({ ...p, doctorId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="">Select a doctor...</option>
                    {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                    <option value="__other">Other (enter manually)</option>
                  </select>
                </div>
                {newAppt.doctorId === '__other' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Doctor Name</label>
                      <input type="text" value={newAppt.customName} onChange={e => setNewAppt(p => ({ ...p, customName: e.target.value }))} placeholder="Dr. Name" className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Specialty</label>
                      <input type="text" value={newAppt.customSpec} onChange={e => setNewAppt(p => ({ ...p, customSpec: e.target.value }))} placeholder="e.g. Cardiologist" className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                    <input type="date" value={newAppt.date} onChange={e => setNewAppt(p => ({ ...p, date: e.target.value }))} required className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Time</label>
                    <input type="time" value={newAppt.time} onChange={e => setNewAppt(p => ({ ...p, time: e.target.value }))} required className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Type</label>
                  <select value={newAppt.type} onChange={e => setNewAppt(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {APPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes (optional)</label>
                  <input type="text" value={newAppt.notes} onChange={e => setNewAppt(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes..." className="w-full px-3 py-2.5 border border-black/[0.12] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddAppt(false)} className="flex-1 px-4 py-2.5 border border-black/[0.12] rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-white text-sm font-semibold rounded-xl" style={{ background: 'linear-gradient(135deg, #3F5F5A, #274743)' }}>Add Appointment</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
