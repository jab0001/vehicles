import { ElNotification, type FormInstance } from "element-plus";

export const useHelpers = () => {
  const validatePromise = (
    form: FormInstance,
    silence: boolean = false,
    tabName: string = ""
  ) =>
    new Promise((res, rej) =>
      form.validate((isValid, fields) => {
        if (isValid) {
          res({ isValid, fields });
        } else {
          const errorMessages = Object.values(fields!)
            .map((arr) => arr.map((item) => item.message).join("\n"))
            .join("\n");

          if (!silence)
            ElNotification({
              title: "Некорректно заполненная форма",
              message: errorMessages,
              type: "error",
            });
          rej({ isValid, fields, tabName });
        }
      })
    );

  const dateKeydownMask = (e: any) => {
    if (e.key != "Backspace") {
      setTimeout(() => {
        if (e.target.value.length == 2 || e.target.value.length == 5) {
          e.target.value = e.target.value + ".";
        }
      });
    }
  };

  const numberIntKeydownMask = (e: any) => {
    // Allow only numbers, backspace, and decimal point
    if ((e.key >= "0" && e.key <= "9") || e.key === "Backspace") {
      return;
    }
    e.preventDefault();
  };

  const numberKeydownMask = (e: any) => {
    // Allow only numbers, backspace, and decimal point
    if (
      (e.key >= "0" && e.key <= "9") ||
      e.key === "Backspace" ||
      e.key === "."
    ) {
      return;
    }
    e.preventDefault();
  };

  const checkNumberRule = (rule: any, value: any, callback: any) => {
    if (value < 1) {
      callback(new Error(rule.message));
    } else {
      callback();
    }
  };
  const checkNumberWithZeroRule = (rule: any, value: any, callback: any) => {
    if (value < 0) {
      callback(new Error(rule.message));
    } else {
      callback();
    }
  };

  const stringToColor = (
    str: string
  ): { text: string; border: string; background: string } => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }

    const text = color;
    const border = color + "CC";
    const background = color + "33";

    return { text, border, background };
  };

  const clearRefEmptyKeys = (refObject: any) => {
    Object.keys(refObject.value).forEach((key) => {
      if (!refObject.value[key]) {
        delete refObject.value[key];
      }
    });
  };

  return {
    validatePromise,
    dateKeydownMask,
    numberIntKeydownMask,
    numberKeydownMask,
    checkNumberRule,
    checkNumberWithZeroRule,
    stringToColor,
    clearRefEmptyKeys,
  };
};
