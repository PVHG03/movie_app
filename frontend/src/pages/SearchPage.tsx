import axios from "axios";
import { Heart, Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useContentStore } from "../store/content";
import { ORIGINAL_IMG_BASE_URL } from "../utils/constant";

const SearchPage = () => {
	const [activeTab, setActiveTab] = useState("movie");
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<
		Array<{ id: number; poster_path?: string; profile_path?: string; title?: string; name?: string }>
	>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1); // To handle the total pages from the API

	const { setContentType } = useContentStore() as any;

	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
		setContentType(tab === "movie" ? "movie" : "tv");
		setResults([]);
		setCurrentPage(1); // Reset page
	};

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		await fetchResults(1); // Start search at page 1
	};

	const fetchResults = async (page: number) => {
		try {
			const res = await axios.get(`/api/v1/${activeTab}/search?query=${searchTerm}&page=${page}`);
			setResults(res.data.content);
			setTotalPages(res.data.totalPages || 1); // Update total pages
			setCurrentPage(page); // Update current page
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				toast.error("Nothing found, make sure you are searching under the right category");
			} else {
				toast.error("An error occurred, please try again later");
			}
		}
	};

	const handlePageChange = (page: number) => {
		if (page > 0 && page <= totalPages) {
			fetchResults(page);
		}
	};

	return (
		<div className='bg-black min-h-screen text-white'>
			<Navbar />
			<div className='container mx-auto px-4 py-8'>
				<div className='flex justify-center gap-3 mb-4'>
					{["movie", "tv", "person"].map((tab) => (
						<button
							key={tab}
							className={`py-2 px-4 rounded ${activeTab === tab ? "bg-red-600" : "bg-gray-800"} hover:bg-red-700`}
							onClick={() => handleTabClick(tab)}
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					))}
				</div>

				<form className='flex gap-2 items-stretch mb-8 max-w-2xl mx-auto' onSubmit={handleSearch}>
					<input
						type='text'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder={"Search for a " + activeTab}
						className='w-full p-2 rounded bg-gray-800 text-white'
					/>
					<button className='bg-red-600 hover:bg-red-700 text-white p-2 rounded'>
						<Search className='size-6' />
					</button>
				</form>

				{/* Pagination */}
				{results.length > 0 && (
					<div className='flex justify-center items-center my-6 gap-2'>
						<button
							disabled={currentPage === 1}
							className={`py-2 px-4 rounded ${currentPage === 1 ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}
							onClick={() => handlePageChange(currentPage - 1)}
						>
							Previous
						</button>
						<span className='py-2 px-4'>
							Page {currentPage} of {totalPages}
						</span>
						<button
							disabled={currentPage === totalPages}
							className={`py-2 px-4 rounded ${
								currentPage === totalPages ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"
							}`}
							onClick={() => handlePageChange(currentPage + 1)}
						>
							Next
						</button>
					</div>
				)}

				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					{results.map((result) => {
						if (!result.poster_path && !result.profile_path) return null;

						return (
							<div key={result.id} className='bg-gray-800 p-4 rounded'>
								{activeTab === "person" ? (
									<div className='flex flex-col items-center'>
										<img
											src={ORIGINAL_IMG_BASE_URL + result.profile_path}
											alt={result.name}
											className='max-h-96 rounded mx-auto'
										/>
										<h2 className='mt-2 text-xl font-bold'>{result.name}</h2>
									</div>
								) : (
									<Link
										to={"/watch/" + result.id}
										onClick={() => {
											setContentType(activeTab);
										}}
									>
										<img
											src={ORIGINAL_IMG_BASE_URL + result.poster_path}
											alt={result.title || result.name}
											className='w-full h-auto rounded'
										/>
										<h2 className='mt-2 text-xl font-bold'>{result.title || result.name}</h2>
									</Link>
								)}
							</div>
						);
					})}
				</div>

				{/* Pagination */}
				{results.length > 0 && (
					<div className='flex justify-center items-center mt-6 gap-2'>
						<button
							disabled={currentPage === 1}
							className={`py-2 px-4 rounded ${currentPage === 1 ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"}`}
							onClick={() => handlePageChange(currentPage - 1)}
						>
							Previous
						</button>
						<span className='py-2 px-4'>
							Page {currentPage} of {totalPages}
						</span>
						<button
							disabled={currentPage === totalPages}
							className={`py-2 px-4 rounded ${
								currentPage === totalPages ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"
							}`}
							onClick={() => handlePageChange(currentPage + 1)}
						>
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchPage;
