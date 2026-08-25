const pt_BR = {
  "title": "Gerenciamento de login único",
  "LDAP": "LDAP",
  "CAS": "CAS",
  "OIDC": "OIDC",
  "OAuth2": "OAuth2",
  "dingtalk": "DingTalk",
  "feishu": "Feishu",
  "callback_url": "URL de callback",
  "feishu_setting": {
    "app_id_tip": "Identificador único do aplicativo na plataforma aberta do Feishu, gerado automaticamente na criação e não editável. O app_id pode ser consultado na página de credenciais e informações básicas do <1>console do desenvolvedor</1>",
    "app_secret_tip": "Chave secreta do aplicativo, gerada automaticamente na criação",
    "cover_attributes_tip": "A cada login, se os dados do usuário tiverem mudado, os dados do Feishu (telefone e e-mail) sobrescrevem os do Nightingale"
  },
  "dingtalk_setting": {
    "enable": "Ativar",
    "display_name": "Nome de exibição",
    "corpId": "ID da organização",
    "corpId_tip": "ID da organização; o CorpId aparece na página inicial da plataforma aberta do DingTalk",
    "client_id": "Client ID",
    "client_secret": "Client secret",
    "cover_attributes": "Atualizar dados do usuário",
    "cover_attributes_tip": "A cada login, se os dados do usuário tiverem mudado, os dados do DingTalk (telefone e e-mail) sobrescrevem os do Nightingale",
    "username_field": "Campo do nome de usuário",
    "default_team": "Equipe padrão",
    "username_field_map": {
      "phone": "Telefone",
      "name": "Nome",
      "email": "E-mail",
      "userid": "ID do usuário"
    },
    "default_roles": "Perfil padrão",
    "auth_url": "Endereço de autenticação",
    "proxy": "Endereço do proxy",
    "use_member_info": "Detalhes do usuário",
    "use_member_info_tip": "Ative esta opção para obter o e-mail e o telefone dos funcionários no catálogo de contatos. É preciso conceder a permissão de detalhes de usuário do catálogo na plataforma aberta do DingTalk",
    "dingtalk_api": "API do DingTalk",
    "dingtalk_api_tip": "Define a API usada para consultar os dados dos funcionários no catálogo de contatos"
  }
};

export default pt_BR;
