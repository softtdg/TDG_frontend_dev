import PickList from '../components/atoms/picklist'
import { Suspense } from 'react'

export default function PicklistPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PickList />
    </Suspense>
  )
} 