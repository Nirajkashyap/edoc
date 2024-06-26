'use client';
import { Authenticated, Refine } from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';

import { AuthPage } from './components/pages/auth';

import { ErrorComponent, useNotificationProvider } from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router-v6';
import { dataProvider, liveProvider, createClient } from './providers/supabase';
import { App as AntdApp } from 'antd';
import {
  createHashRouter,
  HashRouter,
  BrowserRouter,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import authProvider from './authProvider';

import { ThemedLayoutV2 } from './components/layout';
import { ThemedHeaderV2 } from './components/layout/header';
import { ThemedSiderV2 } from './components/layout/sider';
import { ThemedTitleV2 } from './components/layout/title';
import { Header } from './components/layout/header2';

import { ColorModeContextProvider } from './contexts/color-mode';
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from './pages/blog-posts';
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from './pages/categories';
import { VerifyPage } from './components/pages/auth/components/verifyotp';
import { OnBoardingPage } from './pages/on-boarding';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './trpc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
  },
});

const basePath = import.meta.env.BASE_URL;

function App() {
  // const HashRouter = createHashRouter();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3001/api/trpc',
          // You can pass any HTTP headers you wish here
          async headers() {
           const accessToken = (await supabaseClient.auth.getSession()).data?.session?.access_token;

            return {
              authorization: accessToken,
            };
            
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <RefineKbarProvider>
            <ColorModeContextProvider>
              <AntdApp>
                {/* <DevtoolsProvider> */}
                <Refine
                  dataProvider={dataProvider(supabaseClient)}
                  liveProvider={liveProvider(supabaseClient)}
                  authProvider={authProvider(supabaseClient)}
                  routerProvider={routerBindings}
                  notificationProvider={useNotificationProvider}
                  resources={[
                    {
                      name: 'blog_posts',
                      list: '/blog-posts',
                      create: '/blog-posts/create',
                      edit: '/blog-posts/edit/:id',
                      show: '/blog-posts/show/:id',
                      meta: {
                        canDelete: true,
                      },
                    },
                    {
                      name: 'categories',
                      list: '/categories',
                      create: '/categories/create',
                      edit: '/categories/edit/:id',
                      show: '/categories/show/:id',
                      meta: {
                        canDelete: true,
                      },
                    },
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: 'K54lvd-V9qQm8-4ep0yL',
                  }}
                >
                  <Routes>
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-inner2"
                          fallback={<CatchAllNavigate to="/login" />}
                        >
                          <Outlet />
                        </Authenticated>
                      }
                    >
                      <Route path="/on-boarding" element={<OnBoardingPage />} />
                    </Route>
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-inner"
                          fallback={<CatchAllNavigate to="/login" />}
                        >
                          <ThemedLayoutV2
                            Header={() => <Header sticky />}
                            Sider={(props) => (
                              <ThemedSiderV2
                                {...props}
                                fixed
                                Title={ThemedTitleV2}
                              />
                            )}
                          >
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      }
                    >
                      <Route
                        index
                        element={<NavigateToResource resource="blog_posts" />}
                      />

                      <Route path="/blog-posts">
                        <Route index element={<BlogPostList />} />
                        <Route path="create" element={<BlogPostCreate />} />
                        <Route path="edit/:id" element={<BlogPostEdit />} />
                        <Route path="show/:id" element={<BlogPostShow />} />
                      </Route>
                      <Route path="/categories">
                        <Route index element={<CategoryList />} />
                        <Route path="create" element={<CategoryCreate />} />
                        <Route path="edit/:id" element={<CategoryEdit />} />
                        <Route path="show/:id" element={<CategoryShow />} />
                      </Route>
                      <Route path="*" element={<ErrorComponent />} />
                    </Route>
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-outer"
                          fallback={<Outlet />}
                        >
                          <NavigateToResource />
                        </Authenticated>
                      }
                    >
                      <Route
                        path="/login"
                        element={
                          <AuthPage
                            type="login"
                            providers={[
                              { name: 'google', label: 'Sign in with Google' },
                            ]}
                          />
                        }
                      />
                      <Route path="/verifyotp" element={<VerifyPage />} />
                      <Route
                        path="/forgot-password"
                        element={<AuthPage type="forgotPassword" />}
                      />
                    </Route>
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
                {/* </DevtoolsProvider> */}
              </AntdApp>
            </ColorModeContextProvider>
          </RefineKbarProvider>
        </HashRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
