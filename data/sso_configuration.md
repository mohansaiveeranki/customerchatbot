# Single Sign-On (SSO) Configuration
Section: Enterprise Features

Enterprise workspaces can configure SAML 2.0 Single Sign-On (SSO) for centralized user management.

### Supported Providers:
* Okta
* Microsoft Entra ID (Azure AD)
* Google Workspace
* Ping Identity

### Metadata Parameters:
* **Entity ID**: `https://api.omnisupport.com/auth/sso/saml/metadata`
* **Assertion Consumer Service (ACS) URL**: `https://api.omnisupport.com/auth/sso/saml/acs`
* **NameID Format**: EmailAddress