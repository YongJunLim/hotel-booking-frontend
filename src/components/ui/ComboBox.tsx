import type { ComboBoxProps, ListBoxItemProps, ValidationResult } from 'react-aria-components'
import { FieldError, Text } from 'react-aria-components'
import { ComboBox, Input, Popover, ListBox, ListBoxItem } from 'react-aria-components'

interface MyComboBoxProps<T extends object>
  extends Omit<ComboBoxProps<T>, 'children'> {
  description?: string | null
  errorMessage?: string | ((validation: ValidationResult) => string)
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

export function MyComboBox<T extends object>(
  { description, errorMessage, children, ...props }: MyComboBoxProps<T>,
) {
  return (
    <ComboBox {...props}>
      <div className="relative flex items-center border border-gray-300 rounded p-2">
        <Input
          className="flex-1 outline-none"
          placeholder="Destination"
        />
      </div>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="w-1/2 max-h-20 overflow-y-auto bg-white border border-gray-300 rounded shadow z-50">
        <ListBox>
          {children}
        </ListBox>
      </Popover>
    </ComboBox>
  )
}

export function MyItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      className={({ isFocused, isSelected }) =>
        `my-item ${isFocused ? 'focused' : ''} ${isSelected ? 'selected' : ''}`}
    />
  )
}
