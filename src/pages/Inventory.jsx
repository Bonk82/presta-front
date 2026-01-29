import { useEffect } from 'react';
import { DataApp } from '../context/DataContext';
import { UserAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon, Box, Button, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput, Tooltip } from '@mantine/core';
import {  IconDeviceFloppy, IconEdit, IconSquarePlus, IconTrash,IconMenuOrder,IconChartArrowsVertical,IconCategory,IconCategoryPlus,IconSettingsCheck } from '@tabler/icons-react';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';

const Inventory = () => {
  const { user } = UserAuth();
  const { loading,consumirAPI,configuraciones } = DataApp();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await consumirAPI('/listarPrendas', { opcion: 'T' });
  }

  const formPrenda = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_prenda:0,
      codigo_prenda:'',
      tipo_prenda:'',
      subtipo_prenda:'',
      descripcion:'',
      material:'',
      quilates:'',
      peso_bruto:0,
      peso_neto:0,
      marca:'',
      modelo:'',
      serie:'',
      dimensiones:'',
      estado_prenda:'',
      condiciones:'',
      valor_avaluo:0,
      valor_prestamo:0,
      porcentaje_prestamo:0,
      ubicacion_almacen:'',
      fotografia_url:''
    },
  });

  const crudPrenda = async (data,eliminar) => {
    let newPrenda = { ...data };
    if (data.id_prenda) {
      newPrenda = { ...data, operacion: 'U',usuario_registro: user.usuario };
    } else {
      newPrenda = { ...data, operacion: 'I',usuario_registro: user.usuario};
    }
    if (eliminar) newPrenda.operacion = 'D';
    await consumirAPI('/crudPrenda', newPrenda);
    close();
    formPrenda.reset();
    await cargarData();
  }

  const columnsPrenda = useMemo(
    () => [
      { accessorKey: 'tipo_prenda',header: 'Tipo Prenda',},//+subtipo_prenda
      { accessorKey: 'descripcion',header: 'Detalle',},
      { accessorKey: 'material',header: 'Material',},
      { accessorKey: 'quilates',header: 'Quilates',},
      { accessorKey: 'peso_bruto',header: 'Peso Bruto',},
      { accessorKey: 'peso_neto',header: 'Peso Neto',},
      { accessorKey: 'marca',header: 'Marca',},
      { accessorKey: 'modelo',header: 'Modelo',},
      { accessorKey: 'serie',header: 'Serie',},
      { accessorKey: 'dimensiones',header: 'Dimensiones',},
      { accessorKey: 'estado_prenda',header: 'Estado Prenda',},
      { accessorKey: 'condiciones',header: 'Condiciones',},
      { accessorKey: 'valor_avaluo',header: 'Valor Avaluo',},
      { accessorKey: 'valor_prestamo',header: 'Valor Prestamo',},
      { accessorKey: 'porcentaje_prestamo',header: 'Porcentaje Prestamo',},
      { accessorKey: 'ubicacion_almacen',header: 'Ubicación Almacen',},
      { accessorKey: 'fotografia_url',header: 'Fotografía URL',},
    ],
    [],
  );

  const mostrarRegistro = (data) => {
    console.log('Mostrar registro:', data);
    open();
    formPrenda.reset();
    if (data) formPrenda.setValues(data);
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR la prenda:<br /> <strong>{e.descripcion.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Prenda', cancel: "Cancelar" },
      confirmProps: { color: 'violet' },
      cancelProps:{ style: { backgroundColor: '#084627' } },
      overlayProps:{backgroundOpacity: 0.55, blur: 3,},
      onCancel: () => console.log('Cancel'),
      onConfirm: () => crudPrenda(e, true),
    });
  }

  const tablePrenda = useMantineReactTable({
    columns:columnsPrenda,
    data: configuraciones,
    defaultColumn: { minSize: 50, maxSize: 200, size: 100 },
    initialState: {density: 'xs',},
    enableRowActions: true,
    enableDensityToggle:false,
    enableFullScreenToggle:false,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <Tooltip label="Editar Prenda" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
            <IconEdit color="orange" />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Eliminar Prenda" position="bottom" withArrow>
          <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
            <IconTrash color="crimson" />
          </ActionIcon>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Registrar Nueva Prenda" position="bottom" withArrow>
        <Box>
          <Button onClick={()=>mostrarRegistro()} size='sm' visibleFrom="md" variant='gradient' gradient={{ from: 'green', to: 'money.8', deg: 180 }}>Nueva Prenda</Button>
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
        Gestión de Prendas
      </Text>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'green', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={formPrenda.getValues().id_prenda?'Actualizar Prenda: '+ formPrenda.getValues().id_prenda:'Registrar Prenda'} size='lg' zIndex={20} overlayProps={{backgroundOpacity: 0.55,blur: 3,}} yOffset='10dvh'> 
          <form onSubmit={formPrenda.onSubmit((values) => crudPrenda(values))} style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            <NativeSelect
              label="Tipo Prenda:"
              data={[{label:'SELECCIONE...',value:null},...configuraciones.filter(f=>f.grupo == 'TIPO_PRENDA').map((e) => e.nombre),]}
              required
              leftSection={<IconBuilding size={16} />}
              size='xs'
              key={formPrenda.key("tipo_prenda")}
              {...formPrenda.getInputProps("tipo_prenda")}
            />
            <TextInput
              label="Grupo:"
              placeholder="Grupo de la configuración"
              type='text'
              maxLength={50}
              required
              leftSection={<IconCategory size={16} />}
              key={formPrenda.key('grupo')}
              {...formPrenda.getInputProps('grupo')}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre de la configuración"
              type='text'
              maxLength={100}
              required
              leftSection={<IconSettingsCheck size={16} />}
              key={formPrenda.key('nombre')}
              {...formPrenda.getInputProps('nombre')}
            />
            <TextInput
              label="Sub Grupo:"
              placeholder="Sub grupo de la configuración"
              leftSection={<IconCategoryPlus size={16} />}
              type='text'
              maxLength={100}
              key={formPrenda.key('sub_grupo')}
              {...formPrenda.getInputProps('sub_grupo')}
            />
            <TextInput
              label="Valor:"
              placeholder="Valor de la configuración"
              leftSection={<IconChartArrowsVertical size={16} />}
              type='text'
              maxLength={100}
              key={formPrenda.key('valor')}
              {...formPrenda.getInputProps('valor')}
            />
            <NumberInput
              label="Orden:"
              placeholder="1"
              allowDecimal={false}
              max={50}
              min={1}
              leftSection={<IconMenuOrder size={16} />}
              key={formPrenda.key('orden')}
              {...formPrenda.getInputProps('orden')}
            />
            <Group justify="flex-end" mt="md">
              <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit' disabled={!formPrenda.isDirty() || !formPrenda.isValid()} variant='gradient' gradient={{ from: 'green', to: 'money.8', deg: 180 }}>{!formPrenda.getValues().id_cliente ? 'Registrar':'Actualizar'} Cliente</Button>
            </Group>
          </form>
        </Modal>
        <MantineReactTable table={tablePrenda} />
      </Box>
    </div>
  )
};

export default Inventory;
