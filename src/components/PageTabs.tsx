import CloseIcon from '@mui/icons-material/Close';
import { TabContext, TabList, TabPanelProps, useTabContext } from '@mui/lab';
import { Box, IconButton, Tab, TabProps, styled } from '@mui/material';
import {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useMemo,
} from 'react';

import { DatasetEmpty } from '@/components/DatasetEmpty';
import ErrorBoundary from '@/components/ErrorBoundary';
import { TabContextType } from '@/stores/tabs';
import { borderTheme, isDarkTheme } from '@/utils';

export interface PageTabsProps {
  items: { tab: TabContextType; children: ReactNode }[];
  activeKey: string;
  fallback?: ReactNode;
  onRemove: (key: string) => void;
  onChange: (key: string) => void;
}

export const PageTabList = styled(TabList)(({ theme }) => ({
  borderBottom: borderTheme(theme),
  maxHeight: '32px',
  minHeight: '32px',
  backgroundColor: isDarkTheme(theme) ? '#26282e' : 'white',
  '& .MuiTabs-indicator': {},
}));

export const PageTab = styled((props: TabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  minHeight: '32px',
  maxHeight: '32px',
  textTransform: 'none',
  minWidth: 0,
  margin: 0,
  padding: 0,
  paddingLeft: 9,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(1),
  opacity: 0.8,
  '&:hover': {
    opacity: 1,
  },
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightMedium,
  },
  '&.Mui-focusVisible': {
    backgroundColor: '#d1eaff',
  },
}));

export const PageTabPanel: FunctionComponent<
  PropsWithChildren<TabPanelProps>
> = ({ children, value }) => {
  const { value: contextValue } = useTabContext() || {};
  return (
    <Box
      sx={{
        display: value === contextValue ? 'block' : 'none',
        height: '100%',
      }}
      key={value}
    >
      {children}
    </Box>
  );
};

export function PageTabs({
  items,
  activeKey,
  fallback,
  onChange,
  onRemove,
}: PageTabsProps) {
  const tabList = useMemo(() => {
    return (
      <PageTabList
        variant="scrollable"
        scrollButtons="auto"
        onChange={(_, value) => onChange(value)}
      >
        {items.map(({ tab }) => {
          return (
            <PageTab
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
                  <Box>{tab.displayName}</Box>
                  <IconButton
                    size="small"
                    component="div"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(tab.id);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              }
            />
          );
        })}
      </PageTabList>
    );
  }, [items]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TabContext value={activeKey}>
        <Box>{items?.length > 0 ? tabList : <DatasetEmpty />}</Box>
        <Box sx={{ flex: 1 }}>
          {items.map((item) => {
            const tab = item.tab;
            return (
              <PageTabPanel key={tab.id} value={tab.id}>
                <ErrorBoundary
                  fallback={fallback ?? <p>Something went wrong</p>}
                >
                  {item.children}
                </ErrorBoundary>
              </PageTabPanel>
            );
          })}
        </Box>
      </TabContext>
    </Box>
  );
}
