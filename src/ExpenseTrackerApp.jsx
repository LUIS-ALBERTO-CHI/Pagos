import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, X, LogOut, TrendingDown, Wallet, DollarSign, History, ArrowUpRight, ArrowDownLeft, LayoutGrid, List, Filter, Home, Zap, Utensils, Car, ShoppingBag, Smartphone, Palette, Check, CheckCircle, AlertCircle, Download, Edit } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Plus, X, LogOut, TrendingDown, Wallet, DollarSign, History, ArrowUpRight, ArrowDownLeft, LayoutGrid, List, Filter, Home, Zap, Utensils, Car, ShoppingBag, Smartphone, Palette, Check, CheckCircle, AlertCircle, Download, Edit, FileJson, Upload, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import './ExpenseTrackerApp.css';

const ExpenseTrackerApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cards, setCards] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const fileInputRef = useRef(null);
  
  // Modales
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyCard, setHistoryCard] = useState(null);
  const [historyFilter, setHistoryFilter] = useState({ startDate: null, endDate: null });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Estado para notificaciones (Toasts)
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Estado del tema
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themes = [
    { id: 'light', name: 'Original (Violeta)', color: '#667eea' },
    { id: 'pink', name: 'Rosa Pastel', color: '#ec4899' },
    { id: 'blue', name: 'Azul Océano', color: '#3b82f6' },
    { id: 'green', name: 'Verde Naturaleza', color: '#10b981' },
    { id: 'sunset', name: 'Sunset Glow', color: '#f97316' },
    { id: 'berry', name: 'Berry Crush', color: '#be185d' },
    { id: 'nude', name: 'Latte Makeup', color: '#a16207' },
    { id: 'midnight', name: 'Midnight Glam', color: '#4c1d95' },
    { id: 'bubbles', name: 'Bubble Pop', color: '#f472b6' },
    { id: 'nebula', name: 'Nebula Cósmica', color: '#6366f1' },
    { id: 'dark', name: 'Modo Oscuro', color: '#1e293b' },
  ];

  registerLocale('es', es);

  const users = {
    Luis: { password: 'Luis1106', id: 'luis' },
    Maju: { password: 'Pastelito16', id: 'maju' }
  };

  const [newCard, setNewCard] = useState({
    name: '',
    totalDebt: '',
    color: '#667eea'
  });

  const [newPayment, setNewPayment] = useState({
    amount: '',
    date: new Date(),
    description: ''
  });

  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    date: new Date(),
    category: 'Hogar'
  });

  const colors = ['#4facfe', '#f093fb', '#43e97b', '#fa709a', '#feca57', '#667eea', '#2dd4bf', '#fb923c', '#a78bfa', '#f472b6', '#38bdf8', '#fb7185'];

  useEffect(() => {
    if (currentUser) {
      // 1. Cargar de LocalStorage (Inmediato)
      const stored = localStorage.getItem(`cards_${currentUser}`);
      if (stored) {
        setCards(JSON.parse(stored));
      }
      const storedExpenses = localStorage.getItem(`expenses_${currentUser}`);
      if (storedExpenses) {
        setOtherExpenses(JSON.parse(storedExpenses));
      }

      // 2. Intentar cargar de la Nube (Vercel KV)
      setIsSyncing(true);
      fetch(`/api/expenses?user=${currentUser}`)
        .then(res => {
          if (!res.ok) throw new Error('No api');
          return res.json();
        })
        .then(data => {
          if (data) {
            if (data.cards) setCards(data.cards);
            if (data.otherExpenses) setOtherExpenses(data.otherExpenses);
          }
          setIsCloudConnected(true);
        })
        .catch(() => setIsCloudConnected(false))
        .finally(() => setIsSyncing(false));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      // Guardar Local
      localStorage.setItem(`cards_${currentUser}`, JSON.stringify(cards));
      localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(otherExpenses));

      // Guardar Nube (Debounce simple)
      const timer = setTimeout(() => {
        if (isCloudConnected) {
          setIsSyncing(true);
          fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: currentUser, cards, otherExpenses })
          })
          .then(res => {
             if(res.ok) setIsCloudConnected(true);
             else setIsCloudConnected(false);
          })
          .catch(() => setIsCloudConnected(false))
          .finally(() => setIsSyncing(false));
        }
      }, 1000); // Espera 1 segundo después del último cambio para guardar

      return () => clearTimeout(timer);
    }
  }, [cards, otherExpenses, currentUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users[username];
    if (user && user.password === password) {
      setIsLoggedIn(true);
      setCurrentUser(user.id);
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setCards([]);
    setOtherExpenses([]);
  };

  const addCard = (e) => {
    if (e) e.preventDefault();
    if (newCard.name && newCard.totalDebt) {
      const card = {
        id: Date.now(),
        ...newCard,
        totalDebt: parseFloat(newCard.totalDebt),
        currentDebt: parseFloat(newCard.totalDebt),
        payments: []
      };
      setCards([...cards, card]);
      setNewCard({ name: '', totalDebt: '', color: '#4facfe' });
      setShowAddCard(false);
      setToast({ message: 'Tarjeta agregada correctamente', type: 'success' });
    }
  };

  const updateCard = (e) => {
    if (e) e.preventDefault();
    if (editingCard.name && editingCard.totalDebt) {
      const updatedCards = cards.map(c => {
        if (c.id === editingCard.id) {
          return {
            ...c,
            name: editingCard.name,
            totalDebt: parseFloat(editingCard.totalDebt),
            currentDebt: parseFloat(editingCard.currentDebt),
            color: editingCard.color
          };
        }
        return c;
      });
      setCards(updatedCards);
      setShowEditCard(false);
      setEditingCard(null);
      setToast({ message: 'Tarjeta actualizada', type: 'success' });
    }
  };

  const addPayment = (e) => {
    if (e) e.preventDefault();
    if (selectedCard && newPayment.amount) {
      const payment = {
        id: Date.now(),
        amount: parseFloat(newPayment.amount), 
        date: format(newPayment.date, 'yyyy-MM-dd'),
        description: newPayment.description
      };
      
      const updatedCards = cards.map(card => {
        if (card.id === selectedCard.id) {
          const newCurrentDebt = card.currentDebt - payment.amount;
          return {
            ...card,
            currentDebt: Math.max(0, newCurrentDebt),
            payments: [...card.payments, payment]
          };
        }
        return card;
      });
      
      setCards(updatedCards);
      setNewPayment({ amount: '', date: new Date(), description: '' });
      setShowAddPayment(false);
      setSelectedCard(null);
      setToast({ message: 'Pago registrado exitosamente', type: 'success' });
    }
  };

  const addExpense = (e) => {
    if (e) e.preventDefault();
    if (newExpense.name && newExpense.amount) {
      const expense = {
        id: Date.now(),
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: format(newExpense.date, 'yyyy-MM-dd')
      };
      setOtherExpenses([...otherExpenses, expense]);
      setNewExpense({ name: '', amount: '', date: new Date(), category: 'Hogar' });
      setShowAddExpense(false);
      setToast({ message: 'Gasto agregado', type: 'success' });
    }
  };

  const deleteExpense = (id) => {
    setOtherExpenses(otherExpenses.filter(e => e.id !== id));
    setToast({ message: 'Gasto eliminado', type: 'success' });
  };

  const confirmDeleteCard = () => {
    if (cardToDelete) {
      setCards(cards.filter(c => c.id !== cardToDelete.id));
      setShowDeleteConfirm(false);
      setCardToDelete(null);
      setToast({ message: 'Tarjeta eliminada', type: 'success' });
    }
  };

  const getTotalCardDebt = () => {
    return cards.reduce((sum, card) => sum + card.currentDebt, 0);
  };

  const getTotalExpenses = () => {
    return otherExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalPaid = () => {
    return cards.reduce((sum, card) => {
      const cardPaid = card.payments.reduce((s, p) => s + p.amount, 0);
      return sum + cardPaid;
    }, 0);
  };

  const expenseCategories = {
    'Hogar': <Home size={20} />,
    'Servicios': <Zap size={20} />,
    'Comida': <Utensils size={20} />,
    'Transporte': <Car size={20} />,
    'Compras': <ShoppingBag size={20} />,
    'Suscripciones': <Smartphone size={20} />
  };

  const exportToCSV = () => {
    // Encabezados del CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tipo,Nombre/Concepto,Categoria/Descripcion,Fecha,Monto,Estado\n";

    // 1. Agregar Tarjetas (Deuda actual)
    cards.forEach(card => {
      csvContent += `Tarjeta (Deuda),${card.name},Límite: ${card.totalDebt},-,${card.currentDebt},Pendiente\n`;
      // 2. Agregar Pagos de Tarjetas
      card.payments.forEach(pay => {
         csvContent += `Pago Tarjeta,${card.name},${pay.description || 'Sin nota'},${pay.date},${pay.amount},Pagado\n`;
      });
    });

    // 3. Agregar Otros Gastos
    otherExpenses.forEach(exp => {
      csvContent += `Gasto Extra,${exp.name},${exp.category},${exp.date},${exp.amount},Pendiente\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gastos_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: 'Reporte descargado exitosamente', type: 'success' });
  };

  const exportBackup = () => {
    const data = {
      cards,
      otherExpenses,
      user: username,
      timestamp: new Date().toISOString()
    };
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `respaldo_gastos_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    setToast({ message: 'Copia de seguridad descargada', type: 'success' });
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      const parsedData = JSON.parse(e.target.result);
      setCards(parsedData.cards || []);
      setOtherExpenses(parsedData.otherExpenses || []);
      setToast({ message: 'Datos restaurados correctamente', type: 'success' });
    };
  };

  // --- RENDER LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="app-container login-wrapper">
        <div className="clean-card login-card">
            <div className="text-center mb-8">
              <div className="icon-circle-large gradient-bg">
                <Wallet size={40} color="white" />
              </div>
              <h1 className="title-lg text-dark">Gestor de Gastos</h1>
              <p className="text-gray">Bienvenido de nuevo</p>
            </div>
            
            <form onSubmit={handleLogin} className="form-stack">
              <div>
                <label className="input-label">Usuario</label>
                <input
                  type="text"
                  placeholder="Ej. Luis"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              {loginError && (
                <p className="error-text">{loginError}</p>
              )}
              <button type="submit" className="btn-primary mt-4">
                Iniciar Sesión
              </button>
            </form>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="app-container">
      <div className="dashboard-grid">
        
        {/* --- SIDEBAR / LEFT COLUMN --- */}
        <aside className="dashboard-sidebar">
            <div className="sidebar-header">
                <div className="user-profile">
                    <div className="avatar-circle">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs text-gray">Hola,</p>
                        <h3 className="text-dark font-bold">{username}</h3>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={exportToCSV} className="btn-icon-subtle" title="Exportar a Excel/CSV">
                        <Download size={20} />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleFileChange} 
                      accept=".json" 
                    />
                    <button onClick={exportBackup} className="btn-icon-subtle" title="Guardar Respaldo (JSON)">
                        <FileJson size={20} />
                    </button>
                    <button onClick={handleImportClick} className="btn-icon-subtle" title="Cargar Respaldo">
                        <Upload size={20} />
                    </button>
                    <div className="btn-icon-subtle" title={isCloudConnected ? "Sincronizado con Vercel" : "Solo Local (Sin conexión a Vercel)"}>
                        {isSyncing ? (
                           <RefreshCw size={20} className="animate-spin" />
                        ) : isCloudConnected ? (
                           <Cloud size={20} className="text-green" />
                        ) : (
                           <CloudOff size={20} className="text-gray" />
                        )}
                    </div>
                    <button onClick={() => setShowThemeSelector(true)} className="btn-icon-subtle" title="Cambiar tema">
                        <Palette size={20} />
                    </button>
                    <button onClick={handleLogout} className="btn-icon-subtle" title="Cerrar sesión"><LogOut size={20} /></button>
                </div>
            </div>

            {/* Hero Card Sticky on Desktop */}
            <div className="sticky-wrapper">
                <div className="hero-card">
                    <div className="hero-content">
                        <p className="hero-label">Deuda en Tarjetas</p>
                        <h1 className="hero-amount">${getTotalCardDebt().toFixed(2)}</h1>
                        
                        <div className="hero-stats">
                        <div className="hero-stat-item">
                            <div className="stat-arrow-icon down">
                            <ArrowDownLeft size={16} />
                            </div>
                            <div>
                            <p className="hero-stat-label">Pagado</p>
                            <p className="hero-stat-value">${getTotalPaid().toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="hero-stat-item">
                            <div className="stat-arrow-icon up">
                            <CreditCard size={16} />
                            </div>
                            <div>
                            <p className="hero-stat-label">Tarjetas</p>
                            <p className="hero-stat-value">{cards.length}</p>
                            </div>
                        </div>
                        </div>

                        <div className="mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                            <div className="flex-between">
                                <span className="text-sm opacity-90">Otros Gastos</span>
                                <span className="font-bold">${getTotalExpenses().toFixed(2)}</span>
                            </div>
                             <div className="flex-between mt-2">
                                <span className="text-sm font-bold">Total General</span>
                                <span className="font-bold text-lg">${(getTotalCardDebt() + getTotalExpenses()).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="circle-deco circle-1"></div>
                    <div className="circle-deco circle-2"></div>
                </div>
            </div>
        </aside>

        {/* --- MAIN CONTENT / RIGHT COLUMN --- */}
        <main className="dashboard-content">
          <div className="main-split-layout">
            <section>
            <div className="content-header">
                <h2 className="title-md text-dark">Mis Tarjetas</h2>
                <button onClick={() => setShowAddCard(true)} className="btn-secondary-sm">
                    <Plus size={16} /> Nueva Tarjeta
                </button>
            </div>

            {/* Responsive Grid for Cards */}
            <div className="cards-grid-layout">
                {cards.map(card => (
                    <div key={card.id} className="clean-card card-item-responsive">
                        <div className="card-body-grow">
                            <div className="card-top-row">
                                <div className="card-header-group">
                                    <div 
                                        className="category-icon" 
                                        style={{ background: `${card.color}20`, color: card.color }}
                                    >
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="card-titles">
                                        <h3 className="text-dark font-bold card-title-truncate">{card.name}</h3>
                                        <p className="text-gray text-xs">Límite: ${card.totalDebt.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="card-debt-display">
                                    <p className="text-dark font-bold text-lg">${card.currentDebt.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="card-progress-wrapper">
                                <div className="progress-track-light">
                                    <div 
                                        className="progress-bar-gradient"
                                        style={{ 
                                            width: `${((card.totalDebt - card.currentDebt) / card.totalDebt) * 100}%`
                                        }}
                                    />
                                </div>
                                <div className="flex-between text-xs text-gray mt-2">
                                    <span>Pagado: ${(card.totalDebt - card.currentDebt).toFixed(2)}</span>
                                    <span>{Math.round(((card.totalDebt - card.currentDebt) / card.totalDebt) * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="card-actions-footer">
                            {card.payments.length > 0 ? (
                                <button 
                                    className="btn-text-sm"
                                    onClick={() => {
                                        setHistoryCard(card);
                                        setShowHistory(true);
                                        setHistoryFilter({ startDate: null, endDate: null });
                                    }}
                                >
                                    <History size={14} className="mr-1"/> Historial
                                </button>
                            ) : <div></div>}
                            
                            <div className="action-buttons-group">
                                <button 
                                    onClick={() => {
                                        setEditingCard({...card});
                                        setShowEditCard(true);
                                    }}
                                    className="btn-action-edit"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => {
                                        setCardToDelete(card);
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="btn-action-delete"
                                >
                                    Eliminar
                                </button>
                                <button 
                                    onClick={() => {
                                        setSelectedCard(card);
                                        setShowAddPayment(true);
                                    }}
                                    className="btn-action-pay"
                                >
                                    Pagar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {cards.length === 0 && (
                    <div className="empty-state-grid" onClick={() => setShowAddCard(true)}>
                        <div className="icon-circle-large bg-gray-light">
                            <Plus size={32} className="text-gray" />
                        </div>
                        <p className="text-gray mt-2">Agrega tu primera tarjeta</p>
                    </div>
                )}
            </div>
            </section>

            <section>
            {/* --- OTHER EXPENSES SECTION --- */}
            <div className="content-header">
                <h2 className="title-md text-dark">Otros Gastos</h2>
                <button onClick={() => setShowAddExpense(true)} className="btn-secondary-sm">
                    <Plus size={16} /> Nuevo Gasto
                </button>
            </div>

            <div className="expenses-list-grid">
                {otherExpenses.length === 0 ? (
                    <div className="empty-state-grid" onClick={() => setShowAddExpense(true)}>
                        <p className="text-gray">No hay gastos registrados</p>
                    </div>
                ) : (
                    otherExpenses.map(expense => (
                        <div key={expense.id} className="expense-item-row">
                            <div className="expense-icon-wrapper">
                                {expenseCategories[expense.category] || <ShoppingBag size={20} />}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-dark font-bold">{expense.name}</h4>
                                <p className="text-xs text-gray">{expense.date} • {expense.category}</p>
                            </div>
                            <div className="text-right mr-4">
                                <p className="text-dark font-bold">-${expense.amount.toFixed(2)}</p>
                            </div>
                            <button onClick={() => deleteExpense(expense.id)} className="btn-icon-subtle text-red">
                                <X size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
            </section>
          </div>
        </main>
      </div>

      {/* --- MODALES (Sin cambios funcionales, solo estilo) --- */}
      
      {/* Add Card Modal */}
      {showAddCard && (
        <div className="modal-backdrop">
          <div className="clean-card modal-content-light">
            <div className="header-flex mb-4">
              <h2 className="title-md text-dark">Nueva Tarjeta</h2>
              <button onClick={() => setShowAddCard(false)} className="btn-icon-subtle"><X size={20} /></button>
            </div>
            <form onSubmit={addCard} className="form-stack">
              <div>
                  <label className="input-label">Nombre</label>
                  <input type="text" placeholder="Ej. Visa Oro" value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })} className="input-field"/>
              </div>
              <div>
                  <label className="input-label">Deuda Total</label>
                  <input type="number" placeholder="0.00" step="0.01" value={newCard.totalDebt}
                  onChange={(e) => setNewCard({ ...newCard, totalDebt: e.target.value })} className="input-field"/>
              </div>
              <div>
                <p className="input-label mb-2">Color distintivo</p>
                <div className="color-picker">
                  {colors.map(color => (
                    <button key={color} onClick={() => setNewCard({ ...newCard, color })}
                      className={`color-swatch ${newCard.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}/>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary mt-2">Guardar Tarjeta</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {showEditCard && editingCard && (
        <div className="modal-backdrop">
          <div className="clean-card modal-content-light">
            <div className="header-flex mb-4">
              <h2 className="title-md text-dark">Editar Tarjeta</h2>
              <button onClick={() => setShowEditCard(false)} className="btn-icon-subtle"><X size={20} /></button>
            </div>
            <form onSubmit={updateCard} className="form-stack">
              <div>
                  <label className="input-label">Nombre</label>
                  <input type="text" value={editingCard.name}
                  onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })} className="input-field"/>
              </div>
              <div className="grid-2">
                <div>
                    <label className="input-label">Límite / Total</label>
                    <input type="number" step="0.01" value={editingCard.totalDebt}
                    onChange={(e) => setEditingCard({ ...editingCard, totalDebt: e.target.value })} className="input-field"/>
                </div>
                <div>
                    <label className="input-label">Deuda Actual</label>
                    <input type="number" step="0.01" value={editingCard.currentDebt}
                    onChange={(e) => setEditingCard({ ...editingCard, currentDebt: e.target.value })} className="input-field"/>
                </div>
              </div>
              <div>
                <p className="input-label mb-2">Color distintivo</p>
                <div className="color-picker">
                  {colors.map(color => (
                    <button key={color} type="button" onClick={() => setEditingCard({ ...editingCard, color })}
                      className={`color-swatch ${editingCard.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}/>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary mt-2">Guardar Cambios</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPayment && selectedCard && (
        <div className="modal-backdrop">
          <div className="clean-card modal-content-light">
            <div className="header-flex mb-4">
              <h2 className="title-md text-dark">Registrar Pago</h2>
              <button onClick={() => {setShowAddPayment(false); setSelectedCard(null);}} className="btn-icon-subtle"><X size={20} /></button>
            </div>
            <div className="payment-hero-preview" style={{background: selectedCard.color}}>
              <p className="text-white-80 text-sm">Deuda Actual</p>
              <p className="title-lg text-white">${selectedCard.currentDebt.toFixed(2)}</p>
            </div>
            <form onSubmit={addPayment} className="form-stack mt-4">
              <div>
                  <label className="input-label">Monto a pagar</label>
                  <input type="number" placeholder="0.00" step="0.01" value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} className="input-field" autoFocus/>
              </div>
              <div className="grid-2">
                  <div>
                      <label className="input-label">Fecha</label>
                      <DatePicker
                        selected={newPayment.date}
                        onChange={(date) => setNewPayment({ ...newPayment, date })}
                        className="input-field"
                        dateFormat="d 'de' MMMM, yyyy"
                        locale={es}
                      />
                  </div>
                  <div>
                       <label className="input-label">Nota</label>
                      <input 
                        type="text" 
                        placeholder="Opcional" 
                        value={newPayment.description}
                      onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} className="input-field"/>
                  </div>
              </div>
              <button type="submit" className="btn-primary mt-2">Confirmar Pago</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && cardToDelete && (
        <div className="modal-backdrop">
          <div className="clean-card modal-content-light text-center">
            <div className="icon-circle-large bg-red-soft mx-auto mb-4"><X size={32} className="text-red" /></div>
            <h3 className="title-md text-dark mb-2">¿Eliminar tarjeta?</h3>
            <p className="text-gray mb-6">Estás a punto de eliminar <strong>{cardToDelete.name}</strong>.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={confirmDeleteCard} className="btn-danger flex-1">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-backdrop">
          <div className="clean-card modal-content-light">
            <div className="header-flex mb-4">
              <h2 className="title-md text-dark">Nuevo Gasto</h2>
              <button onClick={() => setShowAddExpense(false)} className="btn-icon-subtle"><X size={20} /></button>
            </div>
            <form onSubmit={addExpense} className="form-stack">
              <div>
                  <label className="input-label">Concepto</label>
                  <input type="text" placeholder="Ej. Alquiler, Internet..." value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} className="input-field" autoFocus/>
              </div>
              <div className="grid-2">
                <div>
                    <label className="input-label">Monto</label>
                    <input type="number" placeholder="0.00" step="0.01" value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} className="input-field"/>
                </div>
                <div>
                    <label className="input-label">Fecha</label>
                    <DatePicker selected={newExpense.date} onChange={(date) => setNewExpense({ ...newExpense, date })} className="input-field" dateFormat="dd/MM/yyyy" locale={es} />
                </div>
              </div>
              <div>
                <label className="input-label mb-2">Categoría</label>
                <div className="category-btn-grid">
                  {Object.keys(expenseCategories).map(cat => (
                    <button key={cat} onClick={() => setNewExpense({ ...newExpense, category: cat })}
                      className={`category-btn ${newExpense.category === cat ? 'active' : ''}`}>
                      {expenseCategories[cat]}
                      <span className="text-xs">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary mt-2">Guardar Gasto</button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && historyCard && (
        <div className="modal-backdrop">
          <div className="clean-card modal-content-light">
            <div className="header-flex mb-4">
              <h2 className="title-md text-dark">Historial</h2>
              <button onClick={() => {setShowHistory(false); setHistoryCard(null);}} className="btn-icon-subtle"><X size={20} /></button>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <Filter size={14} className="text-gray" />
                <h4 className="text-sm font-bold text-dark">Filtrar por fecha</h4>
            </div>
            <div className="flex gap-4 mb-4 items-end">
                <div className="flex-1">
                    <label className="input-label text-xs">Desde</label>
                    <DatePicker
                      selected={historyFilter.startDate}
                      onChange={(date) => setHistoryFilter({ ...historyFilter, startDate: date })}
                      className="input-field"
                      dateFormat="d 'de' MMMM, yyyy"
                      locale={es}
                      placeholderText='Fecha de inicio'
                      isClearable
                    />
                </div>
                <div className="flex-1">
                    <label className="input-label text-xs">Hasta</label>
                    <DatePicker
                      selected={historyFilter.endDate}
                      onChange={(date) => setHistoryFilter({ ...historyFilter, endDate: date })}
                      className="input-field"
                      dateFormat="d 'de' MMMM, yyyy"
                      locale={es}
                      placeholderText='Fecha de fin'
                      isClearable
                    />
                </div>
            </div>

            <div className="history-list">
              {historyCard.payments.length === 0 ? (
                  <p className="text-gray text-center py-4">No hay pagos registrados</p>
              ) : (
                  historyCard.payments
                  .filter(payment => {
                      if (!historyFilter.startDate && !historyFilter.endDate) return true;                      
                      if (historyFilter.startDate && payment.date < format(historyFilter.startDate, 'yyyy-MM-dd')) return false;
                      if (historyFilter.endDate && payment.date > format(historyFilter.endDate, 'yyyy-MM-dd')) return false;
                      return true;
                  })
                  .slice().reverse().map(payment => (
                  <div key={payment.id} className="history-item">
                      <div className="history-icon"><DollarSign size={16} /></div>
                      <div className="flex-1">
                          <p className="text-dark font-bold text-sm">{payment.description || 'Pago realizado'}</p>
                          <p className="text-xs text-gray">{payment.date}</p>
                      </div>
                      <span className="text-green font-bold">+${payment.amount.toFixed(2)}</span>
                  </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="modal-backdrop">
          <div className="clean-card modal-content-light">
            <div className="header-flex mb-4">
              <h2 className="title-md text-dark">Elige un tema</h2>
              <button onClick={() => setShowThemeSelector(false)} className="btn-icon-subtle"><X size={20} /></button>
            </div>
            <div className="theme-grid">
              {themes.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTheme(t.id)}
                  className={`theme-option-btn ${theme === t.id ? 'active' : ''}`}
                >
                  <div className="theme-preview-circle" style={{ background: t.color }}>
                    {theme === t.id && <Check size={16} color="white" />}
                  </div>
                  <span className="text-sm font-bold text-dark">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <p className="text-sm font-bold" style={{ margin: 0 }}>{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseTrackerApp;