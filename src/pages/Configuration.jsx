import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
// import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import {  IconDeviceFloppy, IconEdit, IconSquarePlus, IconTrash,IconMenuOrder,IconChartArrowsVertical,IconCategory,IconCategoryPlus,IconSettingsCheck } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';


const Configuration = () => {
  // const { user } = UserAuth();
  const { loading,consumirAPI,configuraciones } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await consumirAPI('/listarConfiguraciones', { opcion: 'T' });
  }

  const formConfiguracion = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_configuracion:0,
      grupo: '',
      nombre: '',
      sub_grupo: '',
      valor: '',
      orden: 1,
    },
  });

  const crudConfiguracion = async (data,eliminar) => {
    let newConfiguracion = { ...data };
    if (data.id_configuracion) {
      newConfiguracion = { ...data, operacion: 'U' };
    } else {
      newConfiguracion = { ...data, operacion: 'I'};
    }
    if (eliminar) newConfiguracion.operacion = 'D';
    await consumirAPI('/crudConfiguracion', newConfiguracion);
    close();
    formConfiguracion.reset();
    await cargarData();
  }

  const columnsConfiguracion = useMemo(
    () => [
      { accessorKey: 'grupo',header: 'Grupo',},
      { accessorKey: 'nombre',header: 'Nombre',},
      { accessorKey: 'sub_grupo',header: 'Sub Grupo',},
      { accessorKey: 'valor',header: 'Valor',},
      { accessorKey: 'orden',header: 'Orden',},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    console.log('Mostrar registro:', data);
    open();
    formConfiguracion.reset();
    if (data) formConfiguracion.setValues(data);
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR la configuración:<br /> <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Configuración', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#084627' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudConfiguracion(e, true),
    });
  }

  const tableConfiguracion = useMantineReactTable({
    columns:columnsConfiguracion,
    data: configuraciones,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    enableDensityToggle:false,
    enableFullScreenToggle:false,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <Tooltip label="Editar Configuración" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Configuración" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nueva Configuración" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} size='sm' visibleFrom="md" variant='gradient' gradient={{ from: 'green', to: 'money.8', deg: 180 }}>Nueva Configuración</Button>
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

  return (
    <div>
      <Text size='clamp(1.5rem, 2vw, 2rem)' pb={6} mb={'lg'} fw={700} variant="gradient" gradient={{ from: 'gainsboro', to: 'green', deg: 90 }}>
        Gestión de Configuraciones
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'green', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={formConfiguracion.getValues().id_configuracion?'Actualizar Configuración: '+ formConfiguracion.getValues().id_configuracion:'Registrar Configuración'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formConfiguracion.onSubmit((values) => crudConfiguracion(values))} style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <TextInput
              label="Grupo:"
              placeholder="Grupo de la configuración"
              type='text'
              maxLength={50}
              required
              leftSection={<IconCategory size={16} />}
              key={formConfiguracion.key('grupo')}
              {...formConfiguracion.getInputProps('grupo')}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre de la configuración"
              type='text'
              maxLength={100}
              required
              leftSection={<IconSettingsCheck size={16} />}
              key={formConfiguracion.key('nombre')}
              {...formConfiguracion.getInputProps('nombre')}
            />
            <TextInput
              label="Sub Grupo:"
              placeholder="Sub grupo de la configuración"
              leftSection={<IconCategoryPlus size={16} />}
              type='text'
              maxLength={100}
              key={formConfiguracion.key('sub_grupo')}
              {...formConfiguracion.getInputProps('sub_grupo')}
            />
            <TextInput
              label="Valor:"
              placeholder="Valor de la configuración"
              leftSection={<IconChartArrowsVertical size={16} />}
              type='text'
              maxLength={100}
              key={formConfiguracion.key('valor')}
              {...formConfiguracion.getInputProps('valor')}
            />
            <NumberInput
              label="Orden:"
              placeholder="1"
              allowDecimal={false}
              max={50}
              min={1}
              leftSection={<IconMenuOrder size={16} />}
              key={formConfiguracion.key('orden')}
              {...formConfiguracion.getInputProps('orden')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit' disabled={!formConfiguracion.isDirty() || !formConfiguracion.isValid()} variant='gradient' gradient={{ from: 'green', to: 'money.8', deg: 180 }}>{!formConfiguracion.getValues().id_configuracion ? 'Registrar':'Actualizar'} Configuración</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tableConfiguracion} />
      </Box>
    </div>
  )
};

export default Configuration;
