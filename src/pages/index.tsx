import { trpc } from '@/utils/trpc'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import React from 'react'


const SCRYFALL_API = 'https://api.scryfall.com'



export default function Home() {
  // const { data, isLoading } = trpc.useQuery(['hello', { text: "David"}])
  const { data, isLoading } = trpc.useQuery(['find-all'])
  const addMutation = trpc.useMutation('add-entry')


  const [cube, setCube] = useState<Array<string>>([])
  const [cardResults, setCardResults] = useState<Array<string>>([])
  const [inputText, setInputText] = useState('')
  const [toFetch, setToFetch] = useState('')
  const [readyToFetch, setReadyToFetch] = useState(true)
  const [resultsCache, setResultsCache] = useState<{ [key: string]: Array<string> }>({})
  const [selected, setSelected] = useState(0)
  const inputRef: React.RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (toFetch && resultsCache[toFetch]) {
      setCardResults(resultsCache[toFetch])
      return
    }
    if (toFetch && readyToFetch) {
      // add 100 ms
      setTimeout(() => {
        setReadyToFetch(true)
      }, 500)
      console.log('fetching scryfall - ' + Date.now().toString().slice(-4))
      // scryfall request
      fetch(SCRYFALL_API + `/cards/autocomplete?q=${toFetch}`)
        .then(res => res.json()).then(({ data }) => {
          // data = data.length ? data : ['(No Results)']
          setCardResults(data)
          setResultsCache(prev => {
            prev[toFetch] = data
            return prev
          })
        });

      setToFetch('')
      setReadyToFetch(false)
    }
  }, [toFetch, readyToFetch])

  useEffect(() => {
    setToFetch(inputText)
    setCardResults([])
    setSelected(0)
  }, [inputText])

  useEffect(() => {
    console.log(selected)
  }, [selected])

  // --------

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value)
  }

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>, i: number) => {
    event.preventDefault()
    // const c = cube
    // c.splice(i, 1)
    setCube(c => [
      ...c.slice(0, i),
      ...c.slice(i + 1)
    ])
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!cardResults.length) {
      return;
    }
    // change the hovered option
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelected(selected => (selected + 1) % cardResults.length)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelected(selected => (selected + cardResults.length - 1) % cardResults.length)
    }
    // select the hovered option
    if (event.key === 'Enter') {
      event.preventDefault()
      const newCardName = cardResults[selected]
      setCube(c => [
        ...c,
        newCardName
      ])
      addMutation.mutate({ cardName: newCardName })
      setInputText('')
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 p-8">
        <div className='mr-8'>
          <input type="text" ref={inputRef} value={inputText} onChange={handleChange} onKeyDown={handleKeyDown} className="w-full focus:outline-none" />
          {
            cardResults.map((r, i) => (
              <div key={i} className={i === selected ? 'bg-gray-500' : ''}>
                {r}
              </div>
            ))
          }
        </div>

        <div>
          <div>
            My Cube
          </div>
          <br />

          {
            cube.map((cardName, i) => (
              <div key={i} className='flex'>
                {/* <span> */}
                <div>
                  {cardName}
                </div>
                <span className='flex-grow' />
                {/* <span className="w-"></span> */}
                {/* <span className='flex-auto'></span> */}
                <button className="bg-gray-700" onClick={event => handleRemove(event, i)}>x</button>
              </div>
            ))
          }

          {
            isLoading ?
              (<></>) : data?.map(({ cardName }, i) => (
                <div key={i} className='flex'>
                  {/* <span> */}
                  <div>
                    {cardName}
                  </div>
                  <span className='flex-grow' />
                  {/* <span className="w-"></span> */}
                  {/* <span className='flex-auto'></span> */}
                  <button className="bg-gray-700" onClick={event => handleRemove(event, i)}>x</button>
                </div>
              ))
          }
        </div>
      </div>
    </>
  )
}