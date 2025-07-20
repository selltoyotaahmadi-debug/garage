import React from 'react';
import { toPersianDigits } from '../../utils/formatters';

interface IranianLicensePlateProps {
  plateNumber: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  plateRight?: string;
  plateLetter?: string;
  plateMiddle?: string;
  plateLeft?: string;
  onRightChange?: (value: string) => void;
  onLetterChange?: (value: string) => void;
  onMiddleChange?: (value: string) => void;
  onLeftChange?: (value: string) => void;
}

const IranianLicensePlate: React.FC<IranianLicensePlateProps> = ({
  plateNumber,
  editable = false,
  onChange,
  plateRight = '',
  plateLetter = 'الف',
  plateMiddle = '',
  plateLeft = '',
  onRightChange,
  onLetterChange,
  onMiddleChange,
  onLeftChange
}) => {
  // اگر پلاک به صورت کامل وارد شده باشد - فرمت صحیح: 12-الف-345-67
  let right = plateRight;
  let letter = plateLetter;
  let middle = plateMiddle;
  let left = plateLeft;
  
  if (plateNumber) {
    const parts = plateNumber.split('-');
    if (parts.length === 4) {
      right = parts[0] || plateRight;
      letter = parts[1] || plateLetter;
      middle = parts[2] || plateMiddle;
      left = parts[3] || plateLeft;
    }
  }

  const persianLetters = ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'];

  const handleRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (onRightChange) onRightChange(value);
    if (onChange) onChange(`${value}-${letter}-${middle}-${left}`);
  };

  const handleLetterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (onLetterChange) onLetterChange(value);
    if (onChange) onChange(`${right}-${value}-${middle}-${left}`);
  };

  const handleMiddleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    if (onMiddleChange) onMiddleChange(value);
    if (onChange) onChange(`${right}-${letter}-${value}-${left}`);
  };

  const handleLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (onLeftChange) onLeftChange(value);
    if (onChange) onChange(`${right}-${letter}-${middle}-${value}`);
  };

  return (
    <div className="flex items-center justify-center border-2 border-black rounded-md overflow-hidden bg-white text-black w-full max-w-xs mx-auto ltr">
      <div className="flex flex-row-reverse items-center px-2 py-1 w-full justify-around">
        {editable ? (
          <>
            <input
              type="text"
              maxLength={2}
              value={plateLeft}
              onChange={handleLeftChange}
              className="w-12 text-center border-0 focus:ring-0 p-0 text-lg"
              placeholder="۰۰"
            />
            <span className="mx-1">-</span>
            <input
              type="text"
              maxLength={3}
              value={plateMiddle}
              onChange={handleMiddleChange}
              className="w-20 text-center border-0 focus:ring-0 p-0 text-lg"
              placeholder="۰۰۰"
            />
            <span className="mx-1">-</span>
            <select
              value={plateLetter}
              onChange={handleLetterChange}
              className="w-16 text-center border-0 focus:ring-0 p-0 text-lg text-red-600"
            >
              {persianLetters.map(letter => (
                <option key={letter} value={letter}>{letter}</option>
              ))}
            </select>
            <span className="mx-1">-</span>
            <input
              type="text"
              maxLength={2}
              value={plateRight}
              onChange={handleRightChange}
              className="w-12 text-center border-0 focus:ring-0 p-0 text-lg"
              placeholder="۰۰"
            />
          </>
        ) : (
          <>
            {plateNumber ? (
              <div className="flex flex-row-reverse items-center justify-center w-full">
                <span className="text-lg mx-1">{toPersianDigits(left)}</span>
                <span className="text-lg mx-1">ایران</span>
                <span className="text-lg mx-1">{toPersianDigits(middle)}</span>
                <span className="text-lg mx-1 text-red-600">{letter}</span>
                <span className="text-lg mx-1">{toPersianDigits(right)}</span>
              </div>
            ) : (
              <span className="text-lg mx-1 text-gray-400">پلاک نامشخص</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IranianLicensePlate;