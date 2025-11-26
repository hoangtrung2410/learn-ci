export const API_PREFIX = 'api';
export const API_VERSION = 'v1';
export const PHONE = /^\d{1,15}$/;
export const PASSWORD_REGEX =
  '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[~`¿¡!#$%^&*€£@+÷=\\-[\\]\';,/{}()|":<>?._])[A-Za-z\\d~`¿¡!#$%^&*€£@+÷=\\-[\\]\';,/{}()|":<>?._]{8,20}$';
export const PHONE_REGEX = '^(?:\\+)?\\d{10,12}$';
export const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMBER = '0123456789';
export const SPECIAL_CHARACTERS = '!#$%&()*+,-./:;<=>?@[]^_{|}~';
export const PASSWORD_CHARACTERS = `${LETTERS}${NUMBER}${SPECIAL_CHARACTERS}`;
export const SHARING_KEY_CHARACTERS = `${LETTERS}${NUMBER}`;
export const endWrapperBodyTemplate = '{% end_content_attribute %}';
export const startWrapperBodyTemplate = '{% content_attribute "email_body" %}';
export const hubspotAutoRenderComment =
  '<!--\n  templateType: "email"\n  isAvailableForNewContent: true\n-->\n';
export const EXCHANGES_NAME = 'amq.direct';
export const EXCHANGES_TYPE = 'direct';
