import ErrorMessage from './ErrorMessage';
import Loading from './Loading';
export default function ResourceState({resource}) {
 if(resource.loading) return <Loading />;
 if(resource.error) return <div><ErrorMessage message={resource.error}/><button className="secondary-button" onClick={resource.reload}>Try again</button></div>;
 return null;
}
