export const getUserFullname = (
  lastName: string | undefined,
  firstName: string | undefined,
  middleName: string | undefined
) => {
  const nameArray = [lastName, firstName, middleName].filter(Boolean);
  return nameArray.join(" ");
};

export const getVehicleFullname = (
  brand: string,
  carModel: string,
  plateNumber?: string
) => {
  if (plateNumber) {
    return `${brand} ${carModel} - ${plateNumber}`;
  } else {
    return `${brand} ${carModel}`;
  }
};
