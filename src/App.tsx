import { Route, Switch } from 'wouter'
import { RootLayout } from './components/layout/RootLayout'
import { NotFound } from './components/ui/NotFound'
import { HomePage } from './pages/HomePage'
import { ResultsPage } from './pages/ResultsPage'
import { HotelDetailPage } from './pages/HotelDetailPage'

function App() {
  return (
    <RootLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/results/:destination_id" component={ResultsPage} />
        <Route path="/hotels/detail/:hotel_id" component={HotelDetailPage} />

        /* 404 fallback route */
        <Route component={NotFound} />
      </Switch>
    </RootLayout>
  )
}

export default App
