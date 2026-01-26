import 'dayjs/locale/es';
import { Route, Routes } from 'react-router-dom'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import '@mantine/charts/styles.css';
import './App.css'
import { Burger, createTheme, em, Group, Image, MantineProvider, Text } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from "@mantine/modals";
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoutes'
import Dashboard from './pages/Dashboard';
import { AppShell } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import Header from './components/Header';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { DatesProvider } from '@mantine/dates';
import Loan from './pages/Loan';
import Inventory from './pages/Inventory';
import Configuration from './pages/Configuration';
import Cashier from './pages/Cashier';
import Client from './pages/Client';
import { Tooltip } from 'recharts';

const myTheme =createTheme({
  primaryColor:'money',
  colors:{
    money:[
      '#e6f4ee', // 0 - Muy claro
      '#c2e4d6', // 1
      '#9fd3be', // 2
      '#7bc3a6', // 3
      '#57b28e', // 4
      '#339277', // 5
      '#006241', // 6 - Color base
      '#004d33', // 7
      '#003926', // 8
      '#002519', // 9 - Muy oscuro
    ],
    oro:[
      '#fffbe5', // 0 - Muy claro
      '#fff4b8', // 1
      '#ffed8a', // 2
      '#ffe65c', // 3
      '#ffdf2e', // 4
      '#ffd900', // 5
      '#ffdd00', // 6 - Color base
      '#e6c400', // 7
      '#b39a00', // 8
      '#806f00', // 9 - Muy oscuro
    ]
  },
  primaryShade: 6,
  secondaryColor:'oro',
  fontFamily:'Michroma, sans-serif',
  cursorType:'pointer',
  defaultGradient:{
    from:'money.3',
    to:'#money.7',
    deg:180,
  },
})

function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const location = useLocation();
  let inicio = false;
  
  if(location.pathname == '/login'){
    inicio = true;
    if(mobileOpened) toggleMobile();
    if(desktopOpened) toggleDesktop();
  } else{
    inicio = false;
  }
  return (
    <DataProvider>
      <MantineProvider defaultColorScheme="dark" forceColorScheme="dark" theme={myTheme}>
        <Notifications position="top-right" zIndex={400}/>
        <ModalsProvider>
          <AppShell
            header={{ height: 60}}
            navbar={{width: 300 ,breakpoint: 'sm',collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },}}
            transitionDuration={600}
            transitionTimingFunction='ease'
            style={{maxWidth: '100vw', overflowX: 'hidden'}}
          >
            <AppShell.Header style={{ backgroundColor: 'rgba(0,98,65,0.8)',backdropFilter:' blur(10px)', color: '#ffdd00' , borderBottom: '1px solid #ffdd00',boxShadow: '0 2px 10px rgba(255, 221, 0, 0.7)'}}>
              <Group h="100%" px="md" style={{ justifyContent: 'space-between',overflowX:'hidden'}} color='primary'>
                <Group align="center" h="100%" gap="s" style={{color: '#ffdd00', fontSize: '1.2rem', fontWeight: 'bold',display:"flex" }}>
                  <Burger color="oro.4" opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" disabled={inicio} />
                  <Burger color="oro.4" opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" disabled={inicio} />
                  <Image src={'./assets/LOGO.png'} h={55} w={'auto'}></Image>
                  <Text size='xl' fw={700} visibleFrom='md'>AL FIN PLATITA</Text>
                </Group>
                <Header/>
              </Group>
            </AppShell.Header>
            <AppShell.Navbar w={isMobile ? '100vw' : 300} p="sm" style={{overflow:'hidden',borderRight:'1px solid #ffdd00'}} bg={{base:'#05422e',md:'transparent'}} onClick={toggleMobile}>
              <Navbar/>
            </AppShell.Navbar>
            <AppShell.Main style={{position:"relative",paddingTop:'5rem',overflow:'hidden'}}>
              <DatesProvider settings={{ locale: 'es' }}>
              <Routes>
                <Route path="/login" element={<Login/>} />
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[1,2]}><Dashboard/></ProtectedRoute>} />
                <Route path="/client" element={<ProtectedRoute allowedRoles={[1,2,3]}><Client/></ProtectedRoute>} />
                <Route path="/cashier" element={<ProtectedRoute allowedRoles={[1,2,3]}><Cashier/></ProtectedRoute>} />
                <Route path="/config" element={<ProtectedRoute allowedRoles={[1,2]}><Configuration/></ProtectedRoute>} />
                <Route path="/loan" element={<ProtectedRoute allowedRoles={[1,2,3]}><Loan/></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute allowedRoles={[1,2,3]}><Inventory/></ProtectedRoute>} />
                <Route path="*" element={<div style={{height:'calc(100vh - 80px)',display:'grid',placeItems:'center'}}><h1>404 Página no encontrada</h1></div>} />
              </Routes>
              </DatesProvider>
            </AppShell.Main>
          </AppShell>
        </ModalsProvider>
      </MantineProvider>
    </DataProvider>
  )
}

export default App
