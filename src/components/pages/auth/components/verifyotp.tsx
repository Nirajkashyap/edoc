import React, { useState } from 'react';
import {
  LoginPageProps,
  LoginFormTypes,
  useLink,
  useRouterType,
  useActiveAuthProvider,
} from '@refinedev/core';
import {
  Row,
  Col,
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Checkbox,
  CardProps,
  LayoutProps,
  Divider,
  FormProps,
  theme,
} from 'antd';
import { useLogin, useTranslate, useRouterContext } from '@refinedev/core';

import {
  bodyStyles,
  containerStyles,
  headStyles,
  layoutStyles,
  titleStyles,
} from './styles';
import { ThemedTitleV2 } from '../../../layout/title';
import { truncate } from 'fs';

type VerifyProps = LoginPageProps<LayoutProps, CardProps, FormProps>;
/**
 * **refine** has a default login page form which is served on `/login` route when the `authProvider` configuration is provided.
 *
 * @see {@link https://refine.dev/docs/ui-frameworks/antd/components/antd-auth-page/#login} for more details.
 */
export const VerifyPage: React.FC<VerifyProps> = ({
  providers,
  registerLink,
  forgotPasswordLink,
  rememberMe,
  contentProps,
  wrapperProps,
  renderContent,
  formProps,
  title,
  hideForm,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<LoginFormTypes>();
  const translate = useTranslate();
  const routerType = useRouterType();
  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const hidePhoneForm = useState(false);

  const ActiveLink = routerType === 'legacy' ? LegacyLink : Link;

  const authProvider = useActiveAuthProvider();
  const { mutate: login, isLoading } = useLogin<LoginFormTypes>({
    v3LegacyAuthProviderCompatible: Boolean(authProvider?.isLegacy),
  });
  

  const PageTitle =
    title === false ? null : (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px',
          fontSize: '20px',
        }}
      >
        {title ?? <ThemedTitleV2 collapsed={false} />}
      </div>
    );

  const CardTitle = (
    <Typography.Title
      level={3}
      style={{
        color: token.colorPrimaryTextHover,
        ...titleStyles,
      }}
    >
      {translate('pages.login.title', 'Sign in to your account')}
    </Typography.Title>
  );

  const renderProviders = () => {
    if (providers && providers.length > 0) {
      return (
        <>
          {providers.map((provider) => {
            return (
              <Button
                key={provider.name}
                type="default"
                block
                icon={provider.icon}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: '8px',
                }}
                onClick={() =>
                  login({
                    providerName: provider.name,
                  })
                }
              >
                {provider.label}
              </Button>
            );
          })}
          {!hideForm && (
            <Divider>
              <Typography.Text
                style={{
                  color: token.colorTextLabel,
                }}
              >
                {translate('pages.login.divider', 'or')}
              </Typography.Text>
            </Divider>
          )}
        </>
      );
    }
    return null;
  };

  const CardContent = (
    <Card
      title={CardTitle}
      headStyle={headStyles}
      bodyStyle={bodyStyles}
      style={{
        ...containerStyles,
        backgroundColor: token.colorBgElevated,
      }}
      {...(contentProps ?? {})}
    >
      {renderProviders()}
      {
        <Form<LoginFormTypes>
          layout="vertical"
          form={form}
          onFinish={(values) =>
            login(
              { ...values },
              {
                onSuccess: (data) => {
                  console.log(data);
                  if (data.success) {
                    // handle error
                  }

                  // handle success
                },
              }
            )
          }
          requiredMark={false}
          initialValues={{
            remember: false,
          }}
          {...formProps}
        >
          <Form.Item
            name="otp"
            label={translate('pages.login.fields.otp', 'One Time Pin')}
            rules={[
              { required: true },
              {
                type: 'string',
                message: translate(
                  'pages.login.errors.otp',
                  'Invalid OTP'
                ),
              },
            ]}
          >
            <Input
              size="large"
              placeholder={translate(
                'pages.login.fields.otp',
                'OTP'
              )}
            />
          </Form.Item>
          <Form.Item
            name="otpPhoneNumber"
            label={translate('pages.login.fields.password', 'otpPhoneNumber')}
            hidden={true}
            initialValue={sessionStorage.getItem('phoneNumber')}
           
          >
            <Input
              type="large"
              placeholder=""
              size="large"
              hidden={true}
            />
          </Form.Item>

          {hidePhoneForm && (
            <Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isLoading}
                block
              >
                {translate('pages.login.verify', 'Verify OTP')}
              </Button>
            </Form.Item>
          )}
        </Form>
      }
     
    </Card>
  );

  return (
    <Layout style={layoutStyles} {...(wrapperProps ?? {})}>
      <Row
        justify="center"
        align={hideForm ? 'top' : 'middle'}
        style={{
          padding: '16px 0',
          minHeight: '100dvh',
          paddingTop: hideForm ? '15dvh' : '16px',
        }}
      >
        <Col xs={22}>
          {renderContent ? (
            renderContent(CardContent, PageTitle)
          ) : (
            <>
              {PageTitle}
              {CardContent}
            </>
          )}
        </Col>
      </Row>
    </Layout>
  );
};
