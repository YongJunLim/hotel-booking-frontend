interface CheckBoxProps {
  value: {
    mosque: boolean
    temple: boolean
    church: boolean
    heritage: boolean
  }
  onChange: (newFilters: {
    mosque: boolean
    temple: boolean
    church: boolean
    heritage: boolean
  }) => void
}

export default function CheckBox({ value, onChange }: CheckBoxProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="label cursor-pointer">
        <span className="label-text">Mosque</span>
        <input
          type="checkbox"
          className="checkbox checkbox-md"
          checked={value.mosque}
          onChange={e => onChange({ ...value, mosque: e.target.checked })}
        />
      </label>

      <label className="label cursor-pointer">
        <span className="label-text">Temple</span>
        <input
          type="checkbox"
          className="checkbox checkbox-md"
          checked={value.temple}
          onChange={e => onChange({ ...value, temple: e.target.checked })}
        />
      </label>

      <label className="label cursor-pointer">
        <span className="label-text">Church</span>
        <input
          type="checkbox"
          className="checkbox checkbox-md"
          checked={value.church}
          onChange={e => onChange({ ...value, church: e.target.checked })}
        />
      </label>

      <label className="label cursor-pointer">
        <span className="label-text">Heritage Site</span>
        <input
          type="checkbox"
          className="checkbox checkbox-md"
          checked={value.heritage}
          onChange={e => onChange({ ...value, heritage: e.target.checked })}
        />
      </label>
    </div>
  )
}
