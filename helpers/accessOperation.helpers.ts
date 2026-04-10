export const accessOperations = (operation_category: string | undefined) => {
  if (
    operation_category === "unallocated_funds" ||
    operation_category === "fine" ||
    operation_category === "toll_road"
  ) {
    return {
      accrual: {
        positive: false,
        negative: false,
      },
      cash_register: {
        positive: true,
        negative: true,
      },
    };
  }

  if (operation_category === "rent") {
    return {
        accrual: {
          positive: false,
          negative: true,
        },
        cash_register: {
          positive: true,
          negative: true,
        },
      };
  }

  if (operation_category === "other") {
    return {
        accrual: {
          positive: true,
          negative: true,
        },
        cash_register: {
          positive: true,
          negative: true,
        },
      };
  }

  if (
    operation_category === "repayment_damage" ||
    operation_category === "repayment_franchise" ||
    operation_category === "repayment_deposit"
  ) {
    return {
        accrual: {
          positive: true,
          negative: true,
        },
        cash_register: {
          positive: true,
          negative: false,
        },
      };
  }

  if (operation_category === "damage") {
    return {
        accrual: {
          positive: false,
          negative: false,
        },
        cash_register: {
          positive: false,
          negative: false,
        },
      };
  }

  if (operation_category === "franchise") {
    return {
        accrual: {
          positive: false,
          negative: false,
        },
        cash_register: {
          positive: true,
          negative: true,
        },
      };
  }

  if (operation_category === "deposit") {
    return {
        accrual: {
          positive: false,
          negative: false,
        },
        cash_register: {
          positive: true,
          negative: false,
        },
      };
  }

  return false;
};
