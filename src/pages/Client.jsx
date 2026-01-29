import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Alert, Box, Button, Container, Group, Input, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconBuilding, IconCalendar, IconDeviceFloppy, IconEdit, IconGps, IconPhone, IconSquarePlus, IconTrash, IconUser,IconMail,IconWeight } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';
import { useState } from 'react';
import { IconSettingsDollar } from '@tabler/icons-react';

const Client = () => {
  //TODO  <h1> Client Page & appraisal</h1>
  const { user } = UserAuth();
  const { loading,consumirAPI,clientes,configuraciones } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);
  const [kilates, setKilates] = useState('');
  const [gramos, setGramos] = useState(0);
  const [valorMaximo, setValorMaximo] = useState(0);
  const [valorAcordado, setValorAcordado] = useState(0);
  const [factorAvaluo, setFactorAvaluo] = useState(0);

  // Recalcula valorMaximo cada vez que cambian kilates o gramos
  useEffect(() => {
    if (!kilates || gramos <= 0) {
      setValorMaximo(0);
      return;
    }
    const precioKilate = configuraciones.find(c => c.grupo === 'KILATAJE' && c.nombre === kilates)?.valor || 0;
    setValorMaximo(((Number(precioKilate) * gramos) * (Number(factorAvaluo)/100)).toFixed(2));
  }, [kilates, gramos, configuraciones, factorAvaluo]);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuraciones])

  const cargarData = async () =>{
    await consumirAPI('/listarClientes', { opcion: 'T' });
    const fa = configuraciones.find(c => c.grupo === 'PARAMETRICAS' && c.nombre === 'FACTOR AVALUO')?.valor || 0;
    setFactorAvaluo(fa);
  }

  const formCliente = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_cliente:0,
      codigo_cliente: '',
      tipo_documento: '',
      numero_documento: '',
      nombres: '',
      paterno: '',
      materno: '',
      direccion: '',
      telefonos: '',
      correo: '',
      fecha_nacimiento: '',
      estado_cliente: 'ALTA',
      calificacion_riesgo: 'A',
      observaciones: '',
      usuario_registro: user?.usuario
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const crudCliente = async (data,eliminar) => {
    let newCliente = { ...data };
    if (data.id_cliente) {
      newCliente = { ...data, operacion: 'U', usuario_registro: user.usuario,codigo_cliente:`${data.paterno.slice(0,1)}${data.materno.slice(0,1)}${data.nombres.slice(0,1)}${dayjs(data.fecha_nacimiento).format('YYYYMMDD')}`};
    } else {
      newCliente = { ...data, operacion: 'I', usuario_registro: user.usuario,codigo_cliente:`${data.paterno.slice(0,1)}${data.materno.slice(0,1)}${data.nombres.slice(0,1)}${dayjs(data.fecha_nacimiento).format('YYYYMMDD')}`};
    }
    if (eliminar) newCliente.operacion = 'D';
    await consumirAPI('/crudCliente', newCliente);
    close();
    formCliente.reset();
    await cargarData();
  }

  const columns = useMemo(
    () => [
      { accessorKey: 'codigo_cliente',header: 'Código Cliente',},
      { accessorKey: 'numero_documento',header: 'Número Documento',},
      { accessorKey: 'nombre_completo',header: 'Cliente',},
      { accessorKey: 'direccion',header: 'Dirección',},
      { accessorKey: 'telefonos',header: 'Teléfonos',},
      { accessorKey: 'correo',header: 'Correo',},
      { accessorKey: 'fecha_nacimiento',header: 'Fecha Nacimiento',Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY')}</span>
        ) },
      { accessorKey: 'estado_cliente',header: 'Estado',},
      { accessorKey: 'calificacion_riesgo',header: 'Calificación Riesgo',},
      { accessorKey: 'observaciones',header: 'Observaciones',},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    console.log('Mostrar registro:', data);
    open();
    formCliente.reset();
    if (data) formCliente.setValues(data);
    formCliente.setValues({fecha_nacimiento:dayjs(data?.fecha_nacimiento).format('YYYY-MM-DD')})
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR el cliente:<br /> <strong>{e.nombres.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Cliente', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#084627' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudCliente(e, true),
    });
  }

  const table = useMantineReactTable({
    columns,
    data: clientes,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    enableDensityToggle:false,
    enableFullScreenToggle:false,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <Tooltip label="Editar Cliente" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Cliente" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nuevo Cliente" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} size='sm' visibleFrom="md" variant="gradient" gradient={{ from: 'green', to: 'money.8', deg: 180 }}>Nuevo Cliente</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'green', to: 'money.8', deg: 180 }} hiddenFrom="md" onClick={()=>mostrarRegistro()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
    mantineTableProps:{striped: true,},
    localization:MRT_Localization_ES
  });

  // const calularAvaluo = () => {
  //   if(!kilates || gramos <= 0 || valorMaximo <=0){
  //     return 0;
  //   }
  //   const precioKilate = configuraciones.find(c => c.grupo === 'KILATAJE' && c.nombre === kilates)?.valor_numerico || 0;
  //   const avaluo = precioKilate * gramos;
  //   return avaluo > valorMaximo ? valorMaximo : avaluo;
  // }

  return (
    <div>
      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mb={'lg'} fw={700} variant="gradient" gradient={{ from: 'gainsboro', to: 'green', deg: 90 }}>
        Gestión de Clientes
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'green', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={formCliente.getValues().id_cliente?'Actualizar Cliente: '+ formCliente.getValues().id_cliente:'Registrar Cliente'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formCliente.onSubmit((values) => crudCliente(values))} style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <NativeSelect
              label="Tipo Documento:"
              data={[{label:'SELECCIONE...',value:null},...configuraciones.filter(f=>f.grupo == 'TIPO_DOCUMENTO').map((e) => e.nombre),]}
              required
              leftSection={<IconBuilding size={16} />}
              size='xs'
              key={formCliente.key("tipo_documento")}
              {...formCliente.getInputProps("tipo_documento")}
            />
            <TextInput
              label="Número Documento:"
              placeholder="Número de documento del cliente"
              type='text'
              maxLength={20}
              required
              size='xs'
              leftSection={<IconUser size={16} />}
              key={formCliente.key('numero_documento')}
              {...formCliente.getInputProps('numero_documento')}
            />
            <TextInput
              label="Nombres:"
              placeholder="Nombre del cliente"
              type='text'
              maxLength={100}
              required
              size='xs'
              leftSection={<IconUser size={16} />}
              key={formCliente.key('nombres')}
              {...formCliente.getInputProps('nombres')}
            />
            <TextInput
              label="Apellido Paterno:"
              placeholder="Apellido paterno del cliente"
              leftSection={<IconUser size={16} />}
              type='text'
              required
              size='xs'
              maxLength={100}
              key={formCliente.key('paterno')}
              {...formCliente.getInputProps('paterno')}
            />
            <TextInput
              label="Apellido Materno:"
              placeholder="Apellido materno del cliente"
              leftSection={<IconUser size={16} />}
              type='text'
              size='xs'
              maxLength={100}
              key={formCliente.key('materno')}
              {...formCliente.getInputProps('materno')}
            />
            <TextInput
              label="Dirección:"
              placeholder="Dirección del cliente"
              type='text'
              size='xs'
              required
              maxLength={100}
              leftSection={<IconGps size={16} />}
              key={formCliente.key('direccion')}
              {...formCliente.getInputProps('direccion')}
            />
            <TextInput
              label="Teléfonos:"
              placeholder="68587844"
              maxLength={50}
              minLength={8}
              type='tel'
              size='xs'
              leftSection={<IconPhone size={16} />}
              key={formCliente.key('telefonos')}
              {...formCliente.getInputProps('telefonos')}
            />
            <TextInput
              label="Correo:"
              placeholder="Correo electrónico del cliente"
              maxLength={50}
              minLength={5}
              type='email'
              size='xs'
              leftSection={<IconMail size={16} />}
              key={formCliente.key('correo')}
              {...formCliente.getInputProps('correo')}
            />
            <TextInput
              label="Fecha Nacimiento:"
              type='date'
              size='xs'
              maxLength={10}
              max={dayjs().format('YYYY-MM-DD')}
              leftSection={<IconCalendar size={16} />}
              key={formCliente.key('fecha_nacimiento')}
              {...formCliente.getInputProps('fecha_nacimiento')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit' disabled={!formCliente.isDirty() || !formCliente.isValid()} variant='gradient' gradient={{ from: 'green', to: 'money.8', deg: 180 }}>{!formCliente.getValues().id_cliente ? 'Registrar':'Actualizar'} Cliente</Button>
            </Group>
          </form>
        </Modal>
        <Alert variant="light" color="green" title="Cálculo de Avaluo" icon={<IconSettingsDollar size={16}/>} style={{marginBottom:'1rem'}}>
          <Box className='pre-avaluo-container'>
            <NativeSelect
              label="Kilates:"
              data={[{label:'SELECCIONE...',value:null},...configuraciones.filter(f=>f.grupo == 'QUILATES').map((e) => e.nombre),]}
              leftSection={<IconBuilding size={16} />}
              value={kilates}
              onChange={(event) => setKilates(event.currentTarget.value)}
            />
            <NumberInput
              label="Gramos:"
              placeholder="1"
              allowDecimal={false}
              max={100}
              min={1}
              leftSection={<IconWeight size={16} />}
              value={gramos}
              onChange={setGramos}
            />
            <NumberInput
              label="Valor Máximo:"
              placeholder="1"
              allowDecimal={true}
              decimalScale={2}
              min={1}
              max={valorMaximo ? Number(valorMaximo) : 1}
              leftSection={<IconWeight size={16} />}
              value={valorAcordado || valorMaximo}
              onChange={(value) => {setValorAcordado(value);}}
              onBlur={(event) => {
                const value = Number(event.target.value);
                if (value > Number(valorMaximo)) {
                  setValorAcordado(Number(valorMaximo));
                } else if (value < 1) {
                  setValorAcordado(1);
                }
              }}
            />
          </Box>
        </Alert>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Client