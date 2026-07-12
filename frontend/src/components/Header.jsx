import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';

const ROLE_DISPLAY = {
  FLEET_MANAGER: { label: 'Fleet Manager', color: '#714B67' },
  DISPATCHER: { label: 'Dispatcher', color: '#2B6CB0' },
  DRIVER: { label: 'Driver', color: '#319795' },
  SAFETY_OFFICER: { label: 'Safety Officer', color: '#2F855A' },
  FINANCIAL_ANALYST: { label: 'Financial Analyst', color: '#B7791F' },
};

const Header = ({ user, currentPage, onLogout }) => {
  const roleInfo = user ? ROLE_DISPLAY[user.role] : null;

  return (
    <header style={{
      height: '56px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      zIndex: 9
    }}>
      {/* Page Context */}
      <div>
        <h2 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--text-main)',
          fontFamily: 'var(--font-title)',
          textTransform: 'capitalize'
        }}>
          {currentPage}
        </h2>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          title="Notifications"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
        >
          <Bell size={18} />
        </button>

        {/* User Profile Badge */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '2px',
              backgroundColor: roleInfo?.color || 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '600',
              fontSize: '13px'
            }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>
                {user.name}
              </div>
              <div style={{
                fontSize: '11px',
                color: roleInfo?.color || 'var(--text-muted)',
                fontWeight: '500'
              }}>
                {roleInfo?.label}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'var(--font-family)',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
