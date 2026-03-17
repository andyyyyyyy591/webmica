import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Course } from '@/types/database'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="relative aspect-video bg-gradient-to-br from-violet-100 to-purple-50">
          {course.cover_image ? (
            <Image
              src={course.cover_image}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-violet-300">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          {course.offer_label && (
            <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow">
              {course.offer_label}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          {course.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</p>
          )}
          {course.discount_price ? (
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-lg font-bold text-violet-600">
                {formatPrice(course.discount_price, course.currency)}
              </p>
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(course.price, course.currency)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-lg font-bold text-violet-600">
              {formatPrice(course.price, course.currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
