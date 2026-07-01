const BASE_URL = '/api'

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`,{
        method,
        headers: body? { 'Content-Type': 'application/json'}: undefined,
        body: body ? JSON.stringify(body) : undefined,
    })

    if(!res.ok){
        throw new Error(`Reuqest failed: ${res.status} ${res.statusText}`)
    }

    if(res.status === 204){
        return undefined as T
    }

    return res.json() as Promise<T>
}

export function apiGet<T>(path: string): Promise<T>{
    return request<T>('GET', path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T>{
    return request<T>('POST', path, body)
}

export function apiPut<T>(path: string, body?:unknown): Promise<T> {
    return request<T>('PUT', path, body)
}

export function apiPatch<T>(path: string, body?:unknown): Promise<T>{
    return request<T>('PATCH', path, body)
}

export function apiDelete<T>(path: string): Promise<T>{
    return request<T>('DELETE', path)
}