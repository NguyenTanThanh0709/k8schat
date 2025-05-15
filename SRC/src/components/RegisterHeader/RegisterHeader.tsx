import React from 'react'
import { Link, useMatch } from 'react-router-dom'

export default function RegisterHeader() {
  const registerMatch = useMatch('/register')
  const isRegister = Boolean(registerMatch)
  return (
    <header className='h-[84px] py-5'>
      <div className='container w-[1200px] md:flex md:items-center md:justify-between'>
        <nav className='flex items-center gap-x-2'>
          <Link to='/'>
            <svg viewBox='0 0 192 65' className='mt-[-10px] mr-[-80px] h-[42px] fill-orange lg:h-11'>
              <g fillRule='evenodd'>
                <circle cx="30" cy="30" r="28" stroke="orange" stroke-width="2" fill="none" />
                <polygon 
                  points="30,8 48,19 48,41 30,52 12,41 12,19" 
                  fill="rgba(255,165,0,0.1)" 
                  stroke="orange"
                />
                <path 
                  d="M18,40 L22,22 L30,34 L38,22 L42,40" 
                  stroke="orange" 
                  stroke-width="3" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                />
              </g>
            </svg>
          </Link>
          <div className=' text-xl mb-4 mr-2 lg:text-2xl'>{isRegister ? 'Register' : 'Login'}</div>
        </nav>
        <a
          href='https://help.shopee.vn/vn/s'
          target='_blank'
          rel='noopener noreferrer'
          className='mr-4 cursor-pointer text-ellipsis text-orange'
        >
          Bạn cần giúp đỡ?
        </a>
      </div>
    </header>
  )
}
