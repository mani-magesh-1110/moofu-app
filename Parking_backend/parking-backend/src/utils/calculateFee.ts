import { CalculateFee } from '../type/CalculateFee';

export const calculateFee = ({
  entryTime,
  exitTime,
  ratePerHour,
}: CalculateFee) => {
  const durationMs = exitTime.getTime() - entryTime.getTime();
  const durationHours = Math.ceil((durationMs / 1000) * 60 * 60);

  const fee = durationHours * ratePerHour;
  return { fee, durationHours };
};
