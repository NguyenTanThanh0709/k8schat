import clsx from 'clsx'
import Button from 'src/components/Button'
import { Link } from 'react-router-dom'
import path from 'src/constants/path'
import { Category } from 'src/types/category.type'
import { useTranslation } from 'react-i18next'

interface Props {
  categories: Category[]
  selectedCategory: string
  onChangeCategory: (id: string) => void
}

export default function AsideFilter({ categories, selectedCategory, onChangeCategory }: Props) {
  const { t } = useTranslation('home')



  return (
    <div className="fixed left-0 top-[8rem] z-20 h-[calc(100vh-8rem)] w-[260px] rounded-2xl border bg-white p-5 shadow-lg">
      <div
        className="flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-orange transition-colors cursor-pointer"
        onClick={() => onChangeCategory('')}
      >
        <span className="h-5 w-5">{/* icon here */}</span>
        {t('aside filter.all categories')}
      </div>

      <div className="my-4 h-px w-full bg-gray-200" />

      <ul className="space-y-3">
        {categories.map((categoryItem) => {
          const isActive = categoryItem._id === selectedCategory
          return (
            <li key={categoryItem._id}>
              <div
                className={clsx(
                  'group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                  {
                    'bg-orange/10 text-orange font-semibold': isActive,
                    'text-gray-700 hover:bg-gray-100 hover:text-orange': !isActive
                  }
                )}
                onClick={() => onChangeCategory(categoryItem._id)}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-[-50%] rounded-full bg-orange" />
                )}
                <span className="text-base">{categoryItem.icon}</span>
                <span>{categoryItem.name}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
