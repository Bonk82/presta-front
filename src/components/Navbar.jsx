import { Box, Button, Text } from "@mantine/core"
import { UserAuth } from '../context/AuthContext';
import { useEffect } from "react";
import { useState } from "react";
import apiClient from "../services/apiClient";
import { useLocation, useNavigate } from "react-router-dom";
import { IconBottle, IconCashRegister, IconFileStar, IconSettings, IconTimeline, IconTools, IconUserCheck, IconUserCog, IconUsersGroup } from "@tabler/icons-react";
import { IconFileDollar } from "@tabler/icons-react";
import { IconDiamond } from "@tabler/icons-react";

const Navbar = () => {
  const { user } = UserAuth();
  const [menu, setMenu] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // console.log('Usuario autenticado:', user);
    if (user && menu.length==0) cargarMenu(user.id_rol);
    else setMenu([]);      
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const cargarMenu = async (rol) => {
    try {
      const resp = await apiClient.get('/listarMenu', { params: {opcion:'ROL', id: rol } });
      setMenu(resp);
    } catch (error) {
      console.error('Error al cargar el menú:', error);
    }
  }

  const icons = [
    <IconUsersGroup key={1}/>,
    <IconDiamond key={2} />,
    <IconFileDollar key={3} />,
    <IconCashRegister key={4} />,
    <IconTimeline key={5} />,
    <IconSettings key={6} />,
    <IconTools key={7} />,
  ]

  return (
    <Box style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Text size="lg" style={{marginBottom: '1rem'}}>Menú</Text>
      {menu.map((item, index) => (
        <Button key={index} leftSection={icons[item.nivel -1]} justify='flex-start' variant={location.pathname == item.ruta ? "filled":"light"}  fullWidth onClick={() => navigate(item.ruta)}
        style={{ marginBottom: '0.8rem',letterSpacing: '0.1rem',fontWeight: 'bolder',fontSize: '1.2rem' }}>
          {item.descripcion}
        </Button>
      ))}
      <Box style={{
        marginTop: 'auto',
        marginBottom: '5rem',
        fontSize: '0.9rem',
        color: '#888',
        textAlign: 'center'
      }}>
        Presta App v1.0.0
      </Box>
    </Box>
  )
}

export default Navbar