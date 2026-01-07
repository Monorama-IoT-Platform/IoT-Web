// src/utils/formatter.js

const PHONE_CONFIG = {
  KR: {
    placeholder: "010-0000-0000",
    format: (d) => {
      if (d.length <= 3) return d;
      if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
      return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
    },
  },
  US: {
    placeholder: "000-000-0000",
    format: (d) => {
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
      return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`;
    },
  },
  JP: {
    placeholder: "090-0000-0000",
    format: (d) => {
      if (d.length <= 3) return d;
      if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
      return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
    },
  },
};

// 포맷팅 함수
export const formatPhoneNumber = (value, nationalCode) => {
  const digits = value.replace(/\D/g, "");
  const config = PHONE_CONFIG[nationalCode];
  return config ? config.format(digits) : digits;
};

// 플레이스홀더 함수 추가
export const getPhonePlaceholder = (nationalCode) => {
  return PHONE_CONFIG[nationalCode]?.placeholder || "Phone Number";
};
