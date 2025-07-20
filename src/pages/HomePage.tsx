import { Link } from 'wouter'
// import useAuthStore from '../store'
import { useEffect } from 'react'
import DropdownWithButtons from '../DropDown'
import { MyAccountDropdown } from './MyAccount'
import { destinationTypes, type Destination } from '../types/destination'
import { TypeaheadSearch } from '../components/ui/TypeaheadSearch'
import DayPicker from '../DayPicker'
import { type Country, useRangeStore, useAdultStore, useChildStore, useRoomStore, useCountryStore } from '../States'
import { useForm, type SubmitHandler  } from 'react-hook-form';
import { useLocation } from 'wouter';


export const HomePage = () => {
  // const { logout } = useAuthStore()
  const { range, } = useRangeStore();
  const { Adult, } = useAdultStore();
  const { Child, } = useChildStore();
  const { Room, } = useRoomStore();
  const { country, setCountry } = useCountryStore();

  const from  = range?.from;
  const to = range?.to;
  const start = from?.toISOString().split("T")[0];
  const end = to?.toISOString().split("T")[0];
  const sum = Adult + Child;

  const handleDestinationSelect = (destination: Destination) => {
    setCountry(destination.uid, destination.term, destination.lat, destination.lng)
    console.log('Selected destination:', destination)
  }

  type FormValues = {
    start_?: string;
    end_?: string;
    sum_?: number;
    Room_?: number;
    country_?: Country;
  }; 

  const [, navigate] = useLocation();

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
      country_: country
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    setValue('start_', start);
    setValue('end_', end);
    setValue('sum_', sum);
    setValue('Room_', Room);
    setValue('country_', country)
  }, [start, end, sum, Room]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data.country_);
    if(data.start_ == undefined) {
      setError('start_', {
        type: 'manual',
        message: 'Please select a start date.',
      });
      return;
    } else {
      clearErrors('start_' as any);
    }

    if(data.end_ == undefined) {
      setError('end_', {
        type: 'manual',
        message: 'Please select an end date.',
      });
      return;
    } else {
      clearErrors('end_' as any);
    }

    if(data.sum_ == 0) {
      setError('sum_', {
        type: 'manual',
        message: 'Please enter the number of guests.',
      });
      return;
    } else {
      clearErrors('sum_' as any);
    }

    if(data.Room_ == 0) {
      setError('Room_', {
        type: 'manual',
        message: 'Please enter the number of rooms you require.',
      });
      return;
    }
    else {
      clearErrors('Room_' as any);
    }

    if(data.country_?.uid == "") {
      setError('country_', {
        type: 'manual',
        message: 'Please enter a destination.',
      });
      return;
    } else {
      clearErrors('country_' as any);
    }

    navigate(`/results/${ country.uid }?checkin=${ start }&checkout=${ end }&lang=en_US&currency=SGD&country_code=${ country.term }&guests=${ sum }|${ Room }`);
  };
  
  return (
    <>
      <div>
        <img className="h-96 w-full object-cover" src="/travel.jpg" />
      </div>
      <div className="flex py-4 items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold mb-4">Hotel Booking</h1>
        </div>
        <div className="flex items-center gap-2">
          <MyAccountDropdown />
        </div>
      </div>
      <div>
        <p className="mb-4">Welcome to our hotel booking platform!</p>
      </div>
      <div className="border border-gray-300 w-fit flex p-2">
        <DropdownWithButtons></DropdownWithButtons>
      </div>
      <div className="flex gap-8 py-4 width-100vw">
        <TypeaheadSearch
        onSelect={handleDestinationSelect}
        placeholder="Search destinations..."
        className="w-250"
        limit={5}
        threshold={0.3}
        />
        <div className="p-2 rounded border border-gray-300 width-30vw">
          <DayPicker></DayPicker>
        </div>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input type="hidden" {...register("start_", { required: "Please select a start date." })} />
            <input type="hidden" {...register("end_", { required: "Please select an end date." })} />
            <input type="hidden" {...register("sum_", { required: "Please select the number of guests." })} />
            <input type="hidden" {...register("Room_", { required: "Please select the number of rooms you require." })} />
            <input type="hidden" {...register("Room_", { required: "Please enter a destination." })} />
          </div>
          {errors.start_ && <p className="text-red-500">{errors.start_.message}</p>}
          {errors.end_ && <p className="text-red-500">{errors.end_.message}</p>}
          {errors.sum_ && <p className="text-red-500">{errors.sum_.message}</p>}
          {errors.Room_ && <p className="text-red-500">{errors.Room_.message}</p>}
          {errors.country_ && <p className="text-red-500">{errors.country_.message}</p>}
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
            Search
          </button>
        </form>
      </div>
    </>
  )
}
