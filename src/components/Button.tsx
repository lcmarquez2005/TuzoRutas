import React from 'react';
import { TouchableNativeFeedback, TouchableOpacity, View, Text, Platform } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary';
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  onPress,
  children,
  disabled = false,
  className,
}) => {
  const baseClasses = 'px-4 py-2 rounded-md items-center justify-center min-h-[36px]';

  const variantClasses = {
    contained: 'bg-blue-500',
    outlined: 'border border-blue-500 bg-transparent',
    text: 'bg-transparent',
  };

  const colorClasses = {
    primary: {
      contained: 'bg-blue-500',
      outlined: 'border-blue-500',
      text: 'text-blue-500',
    },
    secondary: {
      contained: 'bg-gray-500',
      outlined: 'border-gray-500',
      text: 'text-gray-500',
    },
  };

  const textColorClasses = {
    contained: 'text-white',
    outlined: 'text-blue-500',
    text: 'text-blue-500',
  };

  const disabledClasses = disabled ? 'opacity-50' : '';

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    colorClasses[color][variant],
    disabledClasses,
    className
  );

  const textClasses = cn(
    'text-sm font-medium',
    textColorClasses[variant],
    disabled ? 'text-gray-400' : ''
  );

  const TouchableComponent = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

  const touchableProps =
    Platform.OS === 'android'
      ? {
          background: TouchableNativeFeedback.Ripple('rgba(255, 255, 255, 0.3)', false),
          useForeground: true,
        }
      : {
          activeOpacity: 0.7,
        };

  return (
    <View className={buttonClasses}>
      <TouchableComponent
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        {...touchableProps}>
        <View className="items-center justify-center px-4 py-2">
          <Text className={textClasses}>{children}</Text>
        </View>
      </TouchableComponent>
    </View>
  );
};

export default Button;
