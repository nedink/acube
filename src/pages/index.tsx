import { trpc } from '@/utils/trpc'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import React from 'react'
import { CubeEntry } from '@prisma/client'


const SCRYFALL_API = 'https://api.scryfall.com'


/**
 * page load -> Query entries, set clientCube
 * clientCube change -> query update
 * 
 * @returns 
 */
export default function Home() {
  const findAllQuery = trpc.useQuery(['find-all'], {
    // refetchInterval: 100,
  })
  const createEntryMutation = trpc.useMutation('create-entry')
  const deleteEntryMutation = trpc.useMutation('delete-entry')

  const [scryfallResult, setScryfallResult] = useState<Array<string>>([])
  const [inputText, setInputText] = useState('')
  const [requestText, setRequestText] = useState('')
  const [readyToRequest, setReadyToRequest] = useState(true)
  const [scryfallResultsCache, setResultsCache] = useState<{ [key: string]: Array<string> }>({})
  const [selected, setSelected] = useState(0)
  // cube data as displayed to user
  const [clientCube, setClientCube] = useState<Array<CubeEntry>>([])

  const inputRef: React.RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null)

  // focus search bar
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // page load -> Query entries, set clientCube
  useEffect(() => {
    setClientCube(findAllQuery.data || [])
  }, [])

  useEffect(() => {
    console.log('fetching')
  }, [findAllQuery.data])

  // useEffect()

  // useEffect(() => {
  //   // setPersistedCube()
  //   console.log('found all')
  // }, [findAllQuery.data])

  // useEffect(() => {
  //   console.log(persistedCube)
  // }, [persistedCube])

  // autocomplete
  useEffect(() => {
    if (requestText && scryfallResultsCache[requestText]) {
      setScryfallResult(scryfallResultsCache[requestText])
      return
    }
    if (requestText && readyToRequest) {
      // add 100 ms
      setTimeout(() => {
        setReadyToRequest(true)
      }, 100)
      console.log('fetching scryfall - ' + Date.now().toString().slice(-4))
      // scryfall request
      fetch(SCRYFALL_API + `/cards/autocomplete?q=${requestText}`)
        .then(res => res.json()).then(({ data }) => {
          setScryfallResult(data)
          setResultsCache(prev => {
            prev[requestText] = data
            return prev
          })
        });

      setRequestText('')
      setReadyToRequest(false)
    }
  }, [requestText, readyToRequest])

  useEffect(() => {
    setRequestText(inputText)
    setScryfallResult([])
    setSelected(0)
  }, [inputText])

  useEffect(() => {
    console.log(selected)
  }, [selected])

  // --------

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value)
  }

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault()
    deleteEntryMutation.mutate({
      id: id
    },
      {
        onSuccess({ success }) {

        }
      })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!scryfallResult.length) {
      return;
    }
    // change the hovered option
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelected(selected => (selected + 1) % scryfallResult.length)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelected(selected => (selected + scryfallResult.length - 1) % scryfallResult.length)
    }
    // select the hovered option
    if (event.key === 'Enter') {
      event.preventDefault()
      const newCardName = scryfallResult[selected]
      createEntryMutation.mutate({
        cardName: newCardName
      })
      // findAllQuery.refetch().then(res => setPersistedCube(res.data || []))
      // const newData = await (await findAllQuery.refetch()).data
      // setPersistedCube(newData || [])
      setInputText('')
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 p-8">
        <div className='mr-8'>
          <input type="text" ref={inputRef} value={inputText} onChange={handleChange} onKeyDown={handleKeyDown} className="w-full focus:outline-none" />
          {
            scryfallResult.map((r, i) => (
              <div key={i} className={i === selected ? 'bg-gray-500' : ''}>
                {r}
              </div>
            ))
          }
        </div>

        <div>
          <div className='flex'>
            <span className='flex-grow'>My Cube</span>
            <span className='text-gray-500'>{(createEntryMutation.isLoading || deleteEntryMutation.isLoading) ? '(Saving...)' : '(Saved)'}</span>
          </div>
          <br />
          {
            findAllQuery.isLoading ? (
              <div className='text-gray-500'>
                Loading...
              </div>
            ) : clientCube.map(({ id, cardName }) => (
              <div key={id} className='flex'>
                <div className='flex-grow'>
                  {cardName}
                </div>
                <button className="bg-gray-700" onClick={event => handleDelete(event, id)}>x</button>
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}