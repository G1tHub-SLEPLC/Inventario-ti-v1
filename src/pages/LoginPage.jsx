import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (err) throw err;
      
      const from = location.state?.from;
      const redirectTo = from ? from.pathname + (from.search || '') : '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError('Credenciales inválidas. Por favor, verifique su correo y contraseña.');
      setCargando(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg"></div>

      <div
        className="login-card-container"
        style={{
          width: '800px',     /* Controla el ancho total de la tarjeta aquí */
          minHeight: '480px'  /* Controla el alto total de la tarjeta aquí */
        }}
      >

        {/* PANEL IZQUIERDO */}
        <div className="login-left">

          {/* Subtle network background pattern (SVG) */}
          <div className="network-bg">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="2" fill="#fff" />
              <circle cx="200" cy="150" r="2" fill="#fff" />
              <circle cx="100" cy="300" r="2" fill="#fff" />
              <circle cx="300" cy="400" r="2" fill="#fff" />
              <line x1="50" y1="50" x2="200" y2="150" stroke="#fff" strokeWidth="1" />
              <line x1="200" y1="150" x2="100" y2="300" stroke="#fff" strokeWidth="1" />
              <line x1="100" y1="300" x2="300" y2="400" stroke="#fff" strokeWidth="1" />
              <line x1="200" y1="150" x2="300" y2="400" stroke="#fff" strokeWidth="1" />
            </svg>
          </div>

          <div className="left-content">
            {/* Controla el TAMAÑO y POSICIÓN del logo cambiando estos valores */}
            <img
              src="/logo2.png"
              alt="Logo SLEP Los Copihues"
              className="brand-logo"
              style={{
                height: '100px',
                top: '-50px',      /* Mover hacia abajo ('20px') o arriba ('-20px') de forma independiente */
                left: '-85px',     /* Mover hacia la derecha ('20px') o izquierda ('-20px') de forma independiente */
              }}
            />

            {/* Controla la POSICIÓN de los textos cambiando estos valores */}
            <div className="footer-text relative" style={{
              top: '-30px',         /* Mover textos arriba/abajo independientemente */
              left: '0px'           /* Mover textos izquierda/derecha independientemente */
            }}>
              <h2>Portal Inventario<br />Tecnologías de la Información</h2>
              <p>Sistema de Inventario<br />de equipamiento, perifericos e insumos informáticos de la Oficina Central de SLEP Los Copihues<br /></p>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="login-right">
          <div className="right-header">
            <div className="lock-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>ACCESO INSTITUCIONAL</span>
            </div>
            <h2>Iniciar sesión</h2>
            <p>Ingresa con tus credenciales institucionales</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>CORREO ELECTRÓNICO</label>
              <div className="input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>CONTRASEÑA</label>
              <div className="input-wrap password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
            </div>

            <button className="btn-submit" type="submit" disabled={cargando}>
              {cargando ? (
                <>
                  <svg className="spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  Ingresar al sistema
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .login-wrapper {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          background: #0f172a; 
          overflow: hidden;
        }

        .login-bg {
          position: absolute;
          top: -5%; left: -5%; right: -5%; bottom: -5%;
          background-image: url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          filter: blur(10px) brightness(0.4);
          z-index: 0;
        }

        .login-card-container {
          position: relative;
          z-index: 10;
          display: flex;
          background: white;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        /* PANEL IZQUIERDO */
        .login-left {
          width: 50%;
          background-color: #132927;
          color: white;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .network-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          opacity: 0.1;
          pointer-events: none;
        }
        
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -20px; left: -20px; right: -20px;
          height: 300px;
          background-image: url('data:image/svg+xml;utf8,<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg"><g stroke="%23ffffff" stroke-width="0.5" opacity="0.1"><line x1="50" y1="150" x2="150" y2="80"/><line x1="150" y1="80" x2="250" y2="120"/><line x1="250" y1="120" x2="350" y2="50"/><line x1="150" y1="80" x2="100" y2="20"/><line x1="250" y1="120" x2="300" y2="180"/><circle cx="50" cy="150" r="3" fill="%23ffffff"/><circle cx="150" cy="80" r="3" fill="%23ffffff"/><circle cx="250" cy="120" r="3" fill="%23ffffff"/><circle cx="350" cy="50" r="3" fill="%23ffffff"/><circle cx="100" cy="20" r="3" fill="%23ffffff"/><circle cx="300" cy="180" r="3" fill="%23ffffff"/></g></svg>');
          background-repeat: repeat-x;
          background-position: bottom center;
          background-size: 400px 200px;
          pointer-events: none;
        }

        .left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }

        .brand-logo {
          position: relative;
          object-fit: contain;
          margin-bottom: 30px;
        }

        .footer-text.relative {
          position: relative;
        }

        .footer-text h2 {
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 15px 0;
          letter-spacing: -0.5px;
        }

        .footer-text p {
          font-size: 14px;
          line-height: 1.4;
          opacity: 0.85;
          margin: 0;
          max-width: 95%;
          font-weight: 400;
        }

        /* PANEL DERECHO */
        .login-right {
          width: 50%;
          background: white;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .right-header {
          margin-bottom: 35px;
        }

        .lock-text {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #115e59;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        .right-header h2 {
          color: #0f172a;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 5px 0;
          letter-spacing: -0.5px;
        }

        .right-header p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
          letter-spacing: 0px;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #F8FAFC;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .input-wrap input:focus {
          border-color: #112A46;
          box-shadow: 0 0 0 1px #112A46;
        }

        .input-wrap input::placeholder {
          color: #94a3b8;
          opacity: 1;
        }

        .password-wrap input {
          padding-right: 40px; 
        }

        .toggle-pwd {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .toggle-pwd:hover { color: #475569; }

        .btn-submit {
          background: #112A46;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
        }

        .btn-submit:hover:not(:disabled) {
          background: #1A3A5F;
        }

        .error-msg {
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 20px;
          border: 1px solid #fca5a5;
        }

        .spinner-icon {
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 950px) {
          .login-card-container {
            width: 90%;
            height: auto;
            min-height: 500px;
          }
          .login-left { display: none; }
          .login-right { padding: 40px; }
        }
      `}</style>
    </div>
  );
}
