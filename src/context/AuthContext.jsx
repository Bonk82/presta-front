// src/context/AuthContext.jsx
import { useContext,useEffect,createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import {jwtDecode} from "jwt-decode";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    //  console.log('en el efect authcontet',user);
    if(!user){
      const storedUser = localStorage.getItem('token');
      if (storedUser) {
        try {
          const decoded = jwtDecode(storedUser);
          console.log('revisando en auth',decoded.exp * 1000 < Date.now(),decoded,user);
        
          decoded.exp * 1000 > Date.now() ? setUser(decoded) : logout(); // Verifica si el token no ha expirado
        } catch (error) {
          console.error('Error al verificar el token:', error);
          logout(); // Token inválido
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  

  const login = async (userData) => {
    console.log({userData});
    const { user, pass } = userData;
    try {
      console.log({baseURL: import.meta.env.VITE_API_URL});
      console.log({apiClient});
      const resp = await apiClient.get('/login',{params:{operacion:'V', user, pass }});
      // const deco = decodificar_token(resp);
      console.log('la resp',resp);
      
      const deco = jwtDecode(resp.newToken);
      // console.log('Token decodificado:', deco);
      // const usuario = {rol:deco.rol,usuario:deco.usuario,sucursal:deco.sucursal,cuenta:deco.cuenta}
      setUser(deco);
      localStorage.setItem('token', resp.newToken);
      localStorage.setItem('ip', resp.ip);
      console.log('el deco',deco);
      
      if([1,5,6].includes(deco.id_rol)) navigate('/dashboard');
      if([2].includes(deco.id_rol)) navigate('/pedido');
      if([3].includes(deco.id_rol)) navigate('/caja');
      if([4].includes(deco.id_rol)) navigate('/inventario');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new Error(error.error || error.message || error || 'Error al iniciar sesión'); // Lanza un error para que pueda ser manejado en el componente que llama a login
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('ip');
    console.log('saliendo');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};