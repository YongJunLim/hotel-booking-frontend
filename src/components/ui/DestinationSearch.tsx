import { useEffect } from 'react'
import DropdownWithButtons from './DropDown'
// import { MyAccountDropdown } from "../components/ui/MyAccount";
import { type Destination } from '../../types/destination'
import DayPicker from './DayPicker'
import { type Country } from '../../types/forms'
import { useFormStore, useCountryStore } from '../../store'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useLocation } from 'wouter'
import { TypeaheadSearch } from './TypeaheadSearch'

export default function DestinationSearch(): React.ReactElement {
  const range = useFormStore(s => s.range)
  const Adult = useFormStore(s => s.Adult)
  const Child = useFormStore(s => s.Children)
  const Room = useFormStore(s => s.Room)
  const { country, setCountry } = useCountryStore()

  const from = range?.from
  const to = range?.to
  const start = from?.toLocaleDateString('sv-SE')
  const end = to?.toLocaleDateString('sv-SE')
  const sum = Adult + Child

  const handleDestinationSelect = (destination: Destination) => {
    setCountry(
      destination.uid,
      destination.term,
      destination.lat,
      destination.lng,
    )
    console.log('Selected destination:', destination)
  }

  type FormValues = {
    start_?: string
    end_?: string
    sum_?: number
    Room_?: number
    country_?: Country
  }

  const [, navigate] = useLocation()

  const {
    register,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      start_: start,
      end_: end,
      sum_: sum,
      Room_: Room,
      country_: country,
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    setValue('start_', start)
    setValue('end_', end)
    setValue('sum_', sum)
    setValue('Room_', Room)
    setValue('country_', country)
  }, [start, end, sum, Room, country, setValue])

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data.country_)
    if (data.start_ == undefined || data.end_ == undefined) {
      setError('root', {
        type: 'manual',
        message: 'Please select a start date and an end date.',
      })
      return
    }
    else {
      clearErrors('root')
    }

    if (data.sum_ == 0) {
      setError('sum_', {
        type: 'manual',
        message: 'Please enter the number of guests.',
      })
      return
    }
    else {
      clearErrors('sum_')
    }

    if (data.Room_ == 0) {
      setError('Room_', {
        type: 'manual',
        message: 'Please enter the number of rooms you require.',
      })
      return
    }
    else {
      clearErrors('Room_')
    }

    if (data.country_?.uid == '') {
      setError('country_', {
        type: 'manual',
        message: 'Please enter a destination.',
      })
      return
    }
    else {
      clearErrors('country_')
    }

    navigate(
      `/results/${country.uid}?checkin=${start}&checkout=${end}&lang=en_US&currency=SGD&country_code=SG&guests=${sum}|${Room}`,
    )
  }
  return (
    <>
      <div className="w-full border border-gray-400 rounded-lg p-4 shadow-md">
        <DropdownWithButtons></DropdownWithButtons>
        <div className="flex flex-col sm:flex-row flex-wrap gap-8 py-4 w-full">
          <TypeaheadSearch
            onSelect={handleDestinationSelect}
            placeholder="Search destinations..."
            className="w-full md:w-[70%] min-w-[300px]"
            limit={5}
            threshold={0.3}
          />
          <DayPicker></DayPicker>
        </div>
        <div>
          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <div>
              <input
                type="hidden"
                {...register('sum_', {
                  required: 'Please select the number of guests.',
                })}
              />
              <input
                type="hidden"
                {...register('Room_', {
                  required: 'Please select the number of rooms you require.',
                })}
              />
              <input
                type="hidden"
                {...register('country_', {
                  required: 'Please enter a destination.',
                })}
              />
            </div>
            {errors.start_ && (<p className="text-red-500">{errors.start_.message}</p>)}
            {errors.end_ && <p className="text-red-500">{errors.end_.message}</p>}
            {errors.root && <p className="text-red-500">{errors.root.message}</p>}
            {errors.sum_ && <p className="text-red-500">{errors.sum_.message}</p>}
            {errors.Room_ && <p className="text-red-500">{errors.Room_.message}</p>}
            {errors.country_ && <p className="text-red-500">{errors.country_.message}</p>}
            <button
              type="submit"
              className="btn btn-primary mt-2"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
