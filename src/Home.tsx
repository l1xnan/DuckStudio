import CloseIcon from '@mui/icons-material/Close';
import TabContext from '@mui/lab/TabContext';
import { Box, BoxProps, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/primitives';
import { useEffect, useMemo } from 'react';

import { MemoDataset, PageProvider } from '@/components/Dataset';
import { FileTab, FileTabList, FileTabPanel } from '@/components/FileTabs';
import { Content, Layout, Sidebar } from '@/components/Layout';
import SidebarTree from '@/components/sidebar';
import { useResize } from '@/hooks';
import classes from '@/hooks/resize.module.css';
import Editor from '@/pages/editor/Editor';
import { TreeNode, useDBListStore } from '@/stores/dbList';
import { useTabsStore } from '@/stores/tabs';

export const DatasetEmpty = styled((props) => <Box {...props} />)<BoxProps>(
  () => ({
    display: 'flex',
    marginTop: '20%',
    height: '100%',
    justifyContent: 'center',
  }),
);

function Home() {
  const appendDB = useDBListStore((state) => state.append);
  const size = useDBListStore((state) => state.size);
  const setSize = useDBListStore((state) => state.setSize);
  const tabs = useTabsStore((state) => state.tabs);
  const activateTab = useTabsStore((state) => state.active);
  const removeTab = useTabsStore((state) => state.remove);
  const currentTab = useTabsStore((state) => state.table);

  async function openDirectory(name?: string) {
    const fileTree: TreeNode = await invoke('get_folder_tree', { name });
    if (fileTree) {
      appendDB({
        data: fileTree,
      });
    }
  }

  async function openUrl() {
    const path: string = await invoke('opened_urls');
    console.log(path);
  }

  useEffect(() => {
    openUrl();
    const unlisten = listen('open-directory', (e) => {
      console.log(e.payload);

      openDirectory(e.payload as string);
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const tabList = useMemo(() => {
    return (
      <FileTabList
        variant="scrollable"
        scrollButtons="auto"
        onChange={(_, value) => activateTab(value)}
      >
        {tabs.map((tab) => {
          return (
            <FileTab
              key={tab.id}
              value={tab.id}
              label={
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    {tab?.displayName ?? tab?.tableName.split('/').at(-1)}
                  </Box>
                  <IconButton
                    size="small"
                    component="div"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              }
            />
          );
        })}
      </FileTabList>
    );
  }, [tabs]);

  const items = useMemo(() => {
    return tabs.map((tab) => {
      return (
        <PageProvider key={tab.id} table={tab}>
          <FileTabPanel value={tab.id}>
            {tab.type === 'editor' ? <Editor /> : <MemoDataset />}
          </FileTabPanel>
        </PageProvider>
      );
    });
  }, [tabs]);

  const [targetRefLeft, sizeLeft, actionLeft] = useResize(
    size,
    'left',
    setSize,
  );

  return (
    <Layout>
      <Box
        ref={targetRefLeft}
        className={classes.sideBar}
        sx={{ width: sizeLeft + 'px' }}
      >
        <Sidebar>
          <SidebarTree />
        </Sidebar>
        <div className={classes.controls}>
          <div className={classes.resizeVertical} onMouseDown={actionLeft} />
        </div>
      </Box>
      <Content sx={{ ml: `${sizeLeft}px` }}>
        <TabContext value={currentTab?.id ?? ''}>
          <Box>{tabs?.length > 0 ? tabList : <DatasetEmpty />}</Box>
          <Box sx={{ height: '100%' }}>{items}</Box>
        </TabContext>
      </Content>
    </Layout>
  );
}

export default Home;
