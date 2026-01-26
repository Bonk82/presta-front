import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import { IconBuilding, IconCashBanknote, IconDeviceFloppy, IconEdit, IconGps, IconPhone, IconSquarePlus, IconTrash, IconUser } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';

const Client = () => {
  //TODO  <h1> Client Page & appraisal</h1>
  const { user } = UserAuth();
  const { loading,consumirAPI,clientes } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await consumirAPI('/listarClientes', { opcion: 'T' });
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
      estado_cliente: '',
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
      newCliente = { ...data, operacion: 'U', usuario_registro: user.usuario };
    } else {
      newCliente = { ...data, operacion: 'I', usuario_registro: user.usuario };
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
      { accessorKey: 'tipo_documento',header: 'Tipo Documento',},
      { accessorKey: 'numero_documento',header: 'Número Documento',},
      { accessorKey: 'nombres',header: 'Nombres',},
      { accessorKey: 'paterno',header: 'Apellido Paterno',},
      { accessorKey: 'materno',header: 'Apellido Materno',},
      { accessorKey: 'direccion',header: 'Dirección',},
      { accessorKey: 'telefonos',header: 'Teléfonos',},
      { accessorKey: 'correo',header: 'Correo',},
      { accessorKey: 'fecha_nacimiento',header: 'Fecha Nacimiento',},
      { accessorKey: 'estado_cliente',header: 'Estado Cliente',},
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
      cancelProps:{ style: { backgroundColor: '#240846' } },
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
          <Button onClick={()=>mostrarRegistro()} style={{marginBottom:'1rem'}} size='sm' visibleFrom="md">Nuevo Cliente</Button>
          <ActionIcon variant="gradient" size="xl" gradient={{ from: 'violet', to: '#2c0d57', deg: 180 }} hiddenFrom="md" onClick={()=>mostrarRegistro()}>
            <IconSquarePlus />
          </ActionIcon>
        </Box>
      </Tooltip>
    ),
    mantineTableHeadCellProps:{style: { fontWeight: 'bold', fontSize: '1.1rem'},},
    mantineTableProps:{striped: true,},
    localization:MRT_Localization_ES
  });

  return (
    <div>
      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mb={'lg'} fw={900} variant="gradient" gradient={{ from: 'gainsboro', to: 'violet', deg: 90 }}>
        Gestión de Clientes
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'violet', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={formCliente.getValues().id_cliente?'Actualizar Cliente: '+ formCliente.getValues().id_cliente:'Registrar Cliente'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formCliente.onSubmit((values) => crudCliente(values))} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <TextInput
              label="Nombre:"
              placeholder="Nombre del cliente"
              type='text'
              maxLength={100}
              required
              leftSection={<IconUser size={16} />}
              key={formCliente.key('nombre')}
              {...formCliente.getInputProps('nombre')}
            />
            <TextInput
              label="Dirección:"
              placeholder="Dirección del cliente"
              type='text'
              maxLength={100}
              leftSection={<IconGps size={16} />}
              key={formCliente.key('direccion')}
              {...formCliente.getInputProps('direccion')}
            />
            <TextInput
              label="Referencia:"
              placeholder="Referencias para llegar al cliente"
              leftSection={<IconBuilding size={16} />}
              type='text'
              maxLength={100}
              key={formCliente.key('referencia')}
              {...formCliente.getInputProps('referencia')}
            />
            <NumberInput
              label="Teléfonos:"
              placeholder="70611111"
              allowDecimal={false}
              maxLength={30}
              min={100000}
              required
              leftSection={<IconPhone size={16} />}
              key={formCliente.key('telefonos')}
              {...formCliente.getInputProps('telefonos')}
            />
            <TextInput
              label="Cuenta Bancaria:"
              placeholder="Banco y núumero de cuenta bancaria"
              maxLength={20}
              minLength={8}
              leftSection={<IconCashBanknote size={16} />}
              key={formCliente.key('cuenta')}
              {...formCliente.getInputProps('cuenta')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>{!formCliente.getValues().id_cliente ? 'Registrar':'Actualizar'} Cliente</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Client